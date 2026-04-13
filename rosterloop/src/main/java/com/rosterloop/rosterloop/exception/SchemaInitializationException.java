package com.rosterloop.rosterloop.exception;

/**
 * Exception thrown when schema initialization fails
 */
public class SchemaInitializationException extends RuntimeException {
    
    public SchemaInitializationException(String message) {
        super(message);
    }
    
    public SchemaInitializationException(String message, Throwable cause) {
        super(message, cause);
    }
}
