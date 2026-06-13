
export default function Footer() {
    return (
        <footer className="text-center px-4 py-6 mt-auto border-t border-gray-200 w-full dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Flatemate Cleaning Roster. All rights reserved.
            </p>
        </footer>
    );
}
