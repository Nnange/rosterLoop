import { useTranslations } from 'next-intl'

export default function Footer() {
    const t = useTranslations('Footer')
    return (
        <footer className="text-center px-4 py-6 mt-auto border-t border-gray-200 w-full dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('rights', { year: new Date().getFullYear() })}
            </p>
        </footer>
    );
}
