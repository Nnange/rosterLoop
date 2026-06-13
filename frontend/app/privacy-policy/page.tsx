'use client'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <main id="main-content" className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 dark:bg-gray-800 dark:shadow-black/30">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-4 dark:text-gray-400">Last updated: April 4, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            RosterLoop ("we", "us", "our", or "Company") operates the RosterLoop service ("Service"). 
            This page informs you of our policies regarding the collection, use, and disclosure of personal 
            data when you use our Service and the choices you have associated with that data.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We are committed to protecting your privacy and ensuring you have a positive experience on our platform. 
            This Privacy Policy explains our information practices and your rights under GDPR, CCPA, and other privacy laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information Collection and Use</h2>
          
          <h3 className="text-xl font-semibold mb-3">Personal Data</h3>
          <p className="text-gray-700 mb-4 dark:text-gray-300">While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 dark:text-gray-300">
            <li>Email address</li>
            <li>First and last name</li>
            <li>Household name and address</li>
            <li>Phone number (optional)</li>
            <li>Profile information</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We may also collect information on how the Service is accessed and used ("Usage Data"). This may include information such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 dark:text-gray-300">
            <li>Computer's IP address</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on pages</li>
            <li>Date and time of visits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We use cookies to maintain your session and improve your experience. By default, we only use essential cookies required for authentication and security.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            You can control cookie preferences through our cookie consent banner (🍪 Cookie Settings at the bottom of the page).
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            <strong>Cookie Types:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 dark:text-gray-300">
            <li><strong>Essential:</strong> Required for authentication and app functionality</li>
            <li><strong>Analytics:</strong> Help us understand how you use our service (optional)</li>
            <li><strong>Marketing:</strong> Used for marketing campaigns (optional)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            The security of your data is important to us, but remember that no method of transmission over the Internet 
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
            your Personal Data, we cannot guarantee its absolute security.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 dark:text-gray-300">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Secure password hashing for authentication</li>
            <li>JWT tokens for session management</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Your Rights (GDPR & CCPA)</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            If you are located in the EU, UK, or California, you have specific rights under GDPR, UK GDPR, and CCPA:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 dark:text-gray-300">
            <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Restrict Processing:</strong> You can limit how we use your data</li>
            <li><strong>Right to Data Portability:</strong> You can export your data in a portable format</li>
            <li><strong>Right to Object:</strong> You can object to certain types of processing</li>
            <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
          </ul>
          <p className="text-gray-700 mt-4 dark:text-gray-300">
            To exercise any of these rights, please contact us at: <strong>privacy@rosterloop.awongnnange.com</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We retain Personal Data for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy, 
            unless a longer retention period is required by law.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            When you request account deletion, we will delete your Personal Data within 30 days, except where we are required to retain it for legal compliance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Third-Party Links</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, 
            you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last updated" date at the top of this Privacy Policy.
          </p>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-900/40">
            <p className="text-gray-700 mb-2 dark:text-gray-300"><strong>Email:</strong> privacy@rosterloop.awongnnange.com</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Data Protection Officer:</strong> Available upon request</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Cookie Settings</h2>
          <p className="text-gray-700 mb-4 dark:text-gray-300">
            You can manage your cookie preferences by clicking the "🍪 Cookie Settings" button at the bottom of any page on our website.
          </p>
        </section>
      </main>
    </div>
  )
}
