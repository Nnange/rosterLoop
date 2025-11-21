
export default function Footer() {
    return (
        <div className="text-center px-4 py-6 mt-12 border-t mt-auto w-full">
            <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Flatemate Cleaning Roster. All rights reserved.
            </p>
        </div>
    );
}