import { IconButton } from "@mui/material";
import React from "react";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const PrivatePolicies = () => {
  return (
    <div className="w-auto overflow-x-hidden  px-4 py-12 text-gray-800">
      {window.location.pathname === "/private-policies" && (
        <div className="relative left-5 -mt-5 md:-mt-0 mb-4 md:mb-0">
          <Link to={-1}>
            <IconButton
              variant="contained"
              color="blue-gray"
              className="bg-blue-gray-200 shadow-lg shadow-blue-gray-500/50 ring-4 ring-blue-gray-300 focus:ring-opacity-50 focus:outline-none transition duration-150 ease-in-out"
            >
              <FaLongArrowAltLeft className="h-4 w-4" />
            </IconButton>
          </Link>
        </div>
      )}
      

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Privacy Policy & Terms of Service</h1>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl mt-8 font-semibold mb-4">Introduction</h2>
          <p className="text-gray-600">
            Welcome to Hestiya Marketplace. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform.
          </p>
        </section>

        {/* Privacy Policy Section */}
        <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
      <p className="text-gray-600">
        <strong>Effective Date:</strong> February 13, 2025<br />
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
      <p className="text-gray-600">
        Welcome to Hestiya Marketplace. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform. By accessing or using Hestiya Marketplace, you agree to the terms outlined in this policy.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">2. Information We Collect</h3>
      <ul className="list-disc ml-5 mt-4 text-gray-600">
        <li><strong>Personal Information:</strong> Name, email address, phone number, government-issued ID, and payment details.</li>
        <li><strong>Transaction Data:</strong> Trading history, account balance, payment transactions, and associated financial records.</li>
        <li><strong>Technical Data:</strong> IP address, device information, cookies, browser type, operating system, and usage data.</li>
        <li><strong>User Communications:</strong> Any correspondence or feedback provided to our support team.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">3. How We Use Your Information</h3>
      <ul className="list-disc ml-5 mt-4 text-gray-600">
        <li>To facilitate carbon credit trades and transactions.</li>
        <li>To verify user identity and prevent fraudulent activities.</li>
        <li>To enhance, personalize, and improve user experience on our platform.</li>
        <li>To comply with legal, regulatory, and compliance obligations.</li>
        <li>To provide customer support and respond to inquiries.</li>
        <li>To send service-related notifications and updates.</li>
        <li>To analyze platform usage and enhance security.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">4. Information Sharing and Disclosure</h3>
      <ul className="list-disc ml-5 mt-4 text-gray-600">
        <li><strong>Service Providers:</strong> With third-party vendors, including payment processors, identity verification services, and cloud storage providers, under strict confidentiality agreements.</li>
        <li><strong>Legal Compliance:</strong> If required by law, regulation, court order, or governmental authority.</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, subject to confidentiality obligations.</li>
        <li><strong>Affiliates and Partners:</strong> With trusted partners to improve services, subject to applicable privacy safeguards.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h3>
      <p className="text-gray-600">
        We implement industry-standard security measures to safeguard your personal data against unauthorized access, disclosure, or misuse. While we take appropriate precautions, no data transmission over the internet is entirely secure, and we cannot guarantee absolute security.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">6. Your Rights and Choices</h3>
      <ul className="list-disc ml-5 mt-4 text-gray-600">
        <li><strong>Access & Correction:</strong> Request access to or correction of your personal data.</li>
        <li><strong>Deletion:</strong> Request the deletion of your personal information, subject to legal and contractual obligations.</li>
        <li><strong>Consent Withdrawal:</strong> Withdraw consent for data processing where applicable.</li>
        <li><strong>Marketing Preferences:</strong> Opt-out of marketing communications at any time.</li>
      </ul>
      <p className="text-gray-600">To exercise your rights, contact us at <a href="mailto:support@hestiya.com" className="text-blue-600 underline">support@hestiya.com</a>.</p>

      <h3 className="text-xl font-semibold mt-6 mb-2">7. Data Retention</h3>
      <p className="text-gray-600">
        We retain your personal information as long as necessary to fulfill legal, regulatory, and operational requirements. Once data is no longer required, we securely dispose of or anonymize it.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">8. Cookies and Tracking Technologies</h3>
      <p className="text-gray-600">
        We use cookies and similar technologies to enhance user experience, analyze usage patterns, and improve platform functionality. You can manage cookie settings through your browser preferences.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">9. Changes to This Privacy Policy</h3>
      <p className="text-gray-600">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page, and where necessary, we will notify you of significant updates.
      </p>

      {/* <h3 className="text-xl font-semibold mt-6 mb-2">10. Contact Us</h3>
      <p className="text-gray-600">
        If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
      </p>
      <p className="text-gray-600">
        Email: <a href="mailto:support@hestiya.com" className="text-blue-600 underline">support@hestiya.com</a>
      </p> */}
    </section>

       {/* Terms and Conditions Section */}
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-4">Terms and Conditions</h2>
  <p className="text-gray-600">
    <strong>Effective Date:</strong> February 13, 2025<br />
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
  <p className="text-gray-600">
    Welcome to Hestiya Marketplace. These Terms and Conditions ("Terms") govern your access to and use of our platform and services. By registering or using Hestiya Marketplace, you acknowledge that you have read, understood, and agreed to these Terms. If you do not agree, you must not use the platform.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">2. User Eligibility</h3>
  <p className="text-gray-600">
    To use Hestiya Marketplace, you must:
  </p>
  <ul className="list-disc ml-5 mt-4 text-gray-600">
    <li>Be at least 18 years old or the legal age of majority in your jurisdiction.</li>
    <li>Provide accurate, complete, and up-to-date registration information.</li>
    <li>Comply with all applicable local, national, and international laws and regulations.</li>
  </ul>

  <h3 className="text-xl font-semibold mt-6 mb-2">3. Account Registration and Security</h3>
  <p className="text-gray-600">
    - Users must create an account to access trading and platform features.<br />
    - You are responsible for maintaining the confidentiality of your account credentials and any activities conducted under your account.<br />
    - You agree to notify us immediately if you suspect unauthorized access or security breaches.<br />
    - Hestiya Marketplace reserves the right to suspend or terminate accounts that violate these Terms or engage in suspicious activities.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">4. Trading and Transactions</h3>
  <p className="text-gray-600">
    - Hestiya Marketplace facilitates the buying and selling of carbon credits and related assets.<br />
    - All transactions are final and binding once confirmed.<br />
    - We do not guarantee the liquidity, stability, or future value of any asset traded on the platform.<br />
    - Hestiya Marketplace reserves the right to suspend, cancel, or reverse transactions suspected of fraud, manipulation, or legal violations.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">5. Fees and Payments</h3>
  <p className="text-gray-600">
    - Transaction fees apply to each trade and are subject to change.<br />
    - Users are responsible for any applicable taxes, fees, or duties arising from their transactions.<br />
    - Payments must be made through the supported payment methods and comply with our payment policies.<br />
    - Failure to complete a payment may result in transaction cancellation or account suspension.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">6. Prohibited Activities</h3>
  <p className="text-gray-600">
    Users must not:
  </p>
  <ul className="list-disc ml-5 mt-4 text-gray-600">
    <li>Engage in fraudulent, deceptive, or unlawful activities.</li>
    <li>Misuse platform features to manipulate asset prices or market trends.</li>
    <li>Upload or distribute harmful, misleading, or infringing content.</li>
    <li>Violate the intellectual property rights of Hestiya Marketplace or third parties.</li>
    <li>Attempt to bypass platform security measures or gain unauthorized access.</li>
    <li>Use bots, scrapers, or automated tools that disrupt platform operations.</li>
  </ul>

  <h3 className="text-xl font-semibold mt-6 mb-2">7. Limitation of Liability</h3>
  <p className="text-gray-600">
    - Hestiya Marketplace provides its services "as is" and "as available" without warranties of any kind.<br />
    - We do not guarantee uninterrupted access, error-free functionality, or protection from cyber threats.<br />
    - Users acknowledge that market fluctuations may result in financial losses, for which Hestiya Marketplace is not liable.<br />
    - Our maximum liability for any claim is limited to the total transaction fees paid by the user in the preceding six (6) months.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">8. Account Suspension and Termination</h3>
  <p className="text-gray-600">
    - We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activities, or pose security risks.<br />
    - Users may request account closure at any time; however, past transactions remain binding.<br />
    - Any outstanding obligations, including unpaid fees or disputes, must be resolved before account termination.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">9. Amendments to Terms</h3>
  <p className="text-gray-600">
    - Hestiya Marketplace reserves the right to modify these Terms at any time.<br />
    - Users will be notified of significant changes through email or platform notifications.<br />
    - Continued use of the platform after updates constitutes acceptance of the revised Terms.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">10. Governing Law and Dispute Resolution</h3>
  <p className="text-gray-600">
    - These Terms shall be governed by and construed in accordance with the laws of the jurisdiction specified in our policies.<br />
    - Any disputes shall first be resolved through good-faith negotiations or mediation.<br />
    - If disputes cannot be resolved amicably, they shall be settled through binding arbitration before pursuing litigation.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">11. Privacy and Data Protection</h3>
  <p className="text-gray-600">
    - We collect, store, and process user data in accordance with our Privacy Policy.<br />
    - Users consent to data collection for account verification, security measures, and compliance with legal requirements.<br />
    - We implement industry-standard security measures but do not guarantee absolute protection against data breaches.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">12. Intellectual Property Rights</h3>
  <p className="text-gray-600">
    - Hestiya Marketplace retains all rights, title, and interest in its trademarks, software, content, and proprietary technology.<br />
    - Users may not reproduce, distribute, or modify platform content without prior written consent.<br />
    - Any user-generated content remains the property of its creator, but users grant Hestiya Marketplace a non-exclusive license to use such content for platform functionality.
  </p>
  <h3 className="text-xl font-semibold mt-6 mb-2">13. Marketing and Publicity</h3>
  <p className="text-gray-600">
  By using Hestiya Marketplace, you grant us the right to use your name, trade name, and/or logo solely for the purpose of identifying you as a client in our marketing, promotional, and public relations materials, including but not limited to our website, presentations, and case studies. This usage will be in accordance with applicable laws and will not misrepresent your relationship with us.
  </p>
</section>

{/* Contact Information */}
<section className="mb-8">
  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
  <p className="text-gray-600">
    If you have any questions regarding our Privacy Policy or Terms of Service, feel free to contact us at: <a href="mailto:support@hestiya.com" className="text-blue-600 underline">support@hestiya.com</a>.
  </p>
  {/* <button
    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    onClick={() => window.open("mailto:support@hestiya.com")}
  >
    Contact Us
  </button> */}
</section>
      </div>
    </div>
  );
};

export default PrivatePolicies;