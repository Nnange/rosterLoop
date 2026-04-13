package com.rosterloop.rosterloop.config;

import com.rosterloop.rosterloop.exception.SchemaInitializationException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Logger;

/**
 * Handles schema initialization and migrations in a production-safe way.
 * This component ensures the max_members column exists and has proper constraints.
 */
@Component
@SuppressWarnings("java:S2221")
public class SchemaInitializer {
    private static final Logger logger = Logger.getLogger(SchemaInitializer.class.getName());
    
    private final DataSource dataSource;
    
    public SchemaInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    @PostConstruct
    public void initializeSchema() {
        try (Connection conn = dataSource.getConnection()) {
            // Check if max_members column exists
            if (!columnExists(conn, "households", "max_members")) {
                logger.info("Adding max_members column to households table");
                addMaxMembersColumn(conn);
            } else {
                // Column exists, but may have NULL values. Fix them.
                logger.info("Fixing NULL values in max_members column");
                fixNullMaxMembers(conn);
            }
        } catch (SQLException e) {
            logger.severe(() -> "Error initializing schema: " + e.getMessage());
            throw new SchemaInitializationException("Failed to initialize schema", e);
        }
    }
    
    /**
     * Check if a column exists in a table
     */
    private boolean columnExists(Connection conn, String tableName, String columnName) throws SQLException {
        try (ResultSet columns = conn.getMetaData().getColumns(null, null, tableName, columnName)) {
            return columns.next();
        }
    }
    
    /**
     * Add max_members column to households table with proper handling of existing data
     */
    private void addMaxMembersColumn(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            // Add the column as nullable first
            stmt.execute("ALTER TABLE households ADD COLUMN max_members INTEGER");
            logger.info("Added max_members column");
            
            // Set max_members based on flatmate_names array length + 1 for existing rows
            // In PostgreSQL, array_length function returns the length of an array
            stmt.execute(
                "UPDATE households SET max_members = COALESCE(array_length(flatmate_names, 1), 0) + 1"
            );
            logger.info("Set max_members based on flatmate_names array length for existing households");
        }
    }
    
    /**
     * Fix NULL values in max_members column (for when column exists but has NULLs)
     */
    private void fixNullMaxMembers(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            // Check if there are any NULL values or default values that need correction
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM households WHERE max_members IS NULL OR max_members = 1");
            if (rs.next() && rs.getInt(1) > 0) {
                int count = rs.getInt(1);
                logger.info(() -> "Found " + count + " rows with NULL or default max_members, fixing based on flatmate_names...");
                
                // Update max_members based on flatmate_names array length + 1
                // In PostgreSQL, array_length function returns the length of an array
                stmt.execute(
                    "UPDATE households SET max_members = COALESCE(array_length(flatmate_names, 1), 0) + 1 " +
                    "WHERE max_members IS NULL OR max_members = 1"
                );
                logger.info("Fixed max_members based on flatmate_names array length");
                
                // Try to add NOT NULL constraint
                try {
                    stmt.execute("ALTER TABLE households ALTER COLUMN max_members SET NOT NULL");
                    logger.info("Added NOT NULL constraint to max_members column");
                } catch (SQLException e) {
                    // If it fails, just log it - the column works fine without the constraint
                    logger.warning(() -> "Could not add NOT NULL constraint: " + e.getMessage());
                }
            }
        }
    }
}

