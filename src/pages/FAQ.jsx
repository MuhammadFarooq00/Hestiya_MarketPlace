import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";
import signUpVideo from "../assets/Hestiya_faqs_videos/Signup.mp4";
import activityHistoryfeaturehestiya from "../assets/Hestiya_faqs_videos/activity-History-feature-hestiya.mp4";
import buyingCreditVideo from "../assets/Hestiya_faqs_videos/buyingCreditVideo.mp4";
import HestiyaLogs from "../assets/Hestiya_faqs_videos/HestiyaLogs.mp4";
import ListingProject from "../assets/Hestiya_faqs_videos/ListingProject.mp4";
import MainPage from "../assets/Hestiya_faqs_videos/MainPage.mp4";
import Retire from "../assets/Hestiya_faqs_videos/Retire.mp4";

// Accordion Item Component
const AccordionItem = ({ index, title, content, videoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const plusSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
    </svg>
  );

  const minusSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
    </svg>
  );

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center pb-6 pt-5 text-slate-800"
      >
        <Typography
          color="blue-gray"
          className="text-[18px] text-start md:text-[20px] font-bold"
        >
          {title}
        </Typography>
        <span className="text-slate-800 transition-transform duration-500">
          {isOpen ? minusSVG : plusSVG}
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
        // style={{ maxHeight: isOpen ? "200px" : "0" }} // Set maxHeight to control opening/closing
      >
        {videoUrl && (
          <div className="video-player-container mt-4 mb-2">
            <video
              controls
              index={index}

              className="w-full rounded-lg"
              style={{ maxHeight: "400px" }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        { !videoUrl && <Typography className="font-normal pb-5 text-sm !text-gray-500">
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </Typography>}
      </div>
    </div>
  );
};

// FAQ Component
const items = [
  {
    title: "How to Create and Set Up Your Account on Hestiya Marketplace?",
    content: "This comprehensive guide walks you through the process of creating your account and getting started with Hestiya Marketplace. Learn about the initial setup, security features, and basic navigation of the platform.",
    videoUrl: signUpVideo
  },
  {
    title: "How to Navigate the Hestiya Marketplace Dashboard?",
    content: "Learn how to connect different types of crypto wallets to your Hestiya account. This tutorial covers MetaMask integration and other supported wallet connections, ensuring secure access to the marketplace.",
    videoUrl: MainPage
  },

  // Marketplace Navigation
  {
    title: "How Do I Use the Marketplace Dashboard?",
    content: "Get familiar with the main dashboard features, including market overview, your portfolio, and quick access to key functionalities. This video explains how to efficiently navigate through different sections of the platform.",
    videoUrl: activityHistoryfeaturehestiya
  },
  {
    title: "How to Browse and Filter Carbon Credit Projects?",
    content: "Discover how to effectively search, filter, and compare different carbon credit projects. Learn about project categories, filtering options, and how to find the most relevant opportunities for your needs.",
    videoUrl: HestiyaLogs
  },

  // Purchasing Process
  {
    title: "How Can I Purchase Carbon Credits Step-by-Step?",
    content: "A detailed walkthrough of the carbon credit purchase process, from selecting credits to completing the transaction. Learn about vintage years, pricing, and quantity selection.",
    videoUrl: buyingCreditVideo
  },
  {
    title: "How Does Carbon Credit Pricing and Fees Work?",
    content: "Get insights into how carbon credit pricing works, including understanding transaction fees, gas fees, and market prices. This guide helps you make informed purchasing decisions.",
    videoUrl: ListingProject
  },

  // P2P Trading
  {
    title: "How to retire your carbon credits?",
    content: "Learn the process of retiring your carbon credits, including the necessary steps, documentation, and how to ensure your retirement is properly recorded.",
    videoUrl: Retire
  },
 

  // Original text-only FAQs continue below
  {
    title: "How does the process of purchasing carbon credits/I-RECs work in the marketplace?",
    content: `The marketplace allows you to browse multiple projects, each offering carbon credits/I-RECs. To get started, navigate to the market page where you'll see a list of available projects. When you find a project you're interested in, click the "Project Detail" button to view more information about the project. On the project detail page, you will find all relevant data about the project, including available carbon credits/I-RECs by vintage year.<br/><br/>
To purchase carbon credits/I-RECs, click the "Add Carbon Credits/I-RECs to Cart" button. This will open a drawer where you can select the vintage year from a dropdown, check the available tonnes for that year, and enter the number of tonnes you wish to purchase. You'll see the price per tonne for each vintage year.
<br/><br/>Once you've made your selections, proceed to the cart page where you can review the projects and vintage years you've added. You can also add credits from different projects. In the cart, you'll see the total USDT required to purchase the credits, and you'll need both USDT and enough wallet gas fees to complete the transaction. After reviewing, you can proceed to finalize your purchase.`
  },
  {
    title:
      "How does the process of purchasing carbon credits/I-RECs work in the marketplace?",
    content: `The marketplace allows you to browse multiple projects, each offering carbon credits/I-RECs. To get started, navigate to the market page where you'll see a list of available projects. When you find a project you're interested in, click the "Project Detail" button to view more information about the project. On the project detail page, you will find all relevant data about the project, including available carbon credits/I-RECs by vintage year.<br/><br/>
To purchase carbon credits/I-RECs, click the "Add Carbon Credits/I-RECs to Cart" button. This will open a drawer where you can select the vintage year from a dropdown, check the available tonnes for that year, and enter the number of tonnes you wish to purchase. You’ll see the price per tonne for each vintage year.
<br/><br/>Once you’ve made your selections, proceed to the cart page where you can review the projects and vintage years you’ve added. You can also add credits from different projects. In the cart, you'll see the total USDT required to purchase the credits, and you’ll need both USDT and enough wallet gas fees to complete the transaction. After reviewing, you can proceed to finalize your purchase.`,
  },
  {
    title:
      "Where can I view my purchased carbon credits/I-RECs and other holdings?",
    content: `After purchasing carbon credits/I-RECs through the marketplace or P2P transactions, you can easily view your holdings in the "Holdings" section of your account. Simply click on the "Holdings" tab to see a comprehensive list of all your items, including the projects and carbon credits/I-RECs you have acquired. This section provides an overview of your investments, allowing you to manage and track your carbon credit/I-RECs portfolio efficiently.`,
  },
  {
    title: "How can I list my carbon credits/I-RECs for sale?",
    content: `To list your carbon credits/I-RECs for sale on the P2P marketplace, navigate to the "Holdings" page where you'll see all your projects displayed with key details. Each project card includes two buttons: "List Credits" and "Retire Credits." Click on the "List Credits" button to open a drawer, where you can view all vintage years of carbon credits/I-RECs you have purchased through P2P or the marketplace. For each vintage year, you will find two input fields to enter the price and quantity of carbon credits/I-RECs you wish to list. Once you've filled in the details, click the "List" button to make your credits/I-RECs available for sale. Please note that you will need sufficient gas fees in your wallet to complete this transaction.`,
  },

  {
    title: "How do I retire my carbon credits/I-RECs?",
    content: `To retire your carbon credits/I-RECs, go to the "Holdings" page and select the project whose credits you wish to retire. Click the "Retire Credits" button to open a drawer that displays each vintage year of your carbon credits/I-RECs. Next to each vintage year, you'll see an input field where you can enter the quantity of carbon credits/I-RECs you want to retire. After entering the desired amount, simply click the "Retire" button to complete the retirement process for your selected carbon credits/I-RECs. Please ensure you have sufficient gas fees in your wallet to process this transaction.`,
  },

  {
    title: "How do I buy carbon credits/I-RECs from the P2P marketplace?",
    content: `To buy carbon credits/I-RECs from the P2P marketplace, first, navigate to the "P2P Trading" tab on the marketplace page. Here, you will find two sections: "Listed Credits" and "My Listings." In the "Listed Credits" section, you can browse available carbon credits/I-RECs for purchase. To complete your purchase, you will need both USDT for payment and sufficient gas fees in your wallet for transaction processing. Once you select the carbon credits/I-RECs you wish to buy, proceed with the transaction, and the purchased credits will be added to your "Holdings" section.`,
  },
  {
    title: "How can I cancel a listing from the P2P marketplace?",
    content: `To cancel a listing from the P2P marketplace, go to the "P2P Trading" tab and select the "My Listings" section. Here, you will see a list of all your carbon credits/I-RECs that are currently listed for sale, along with details about each vintage credit. If you decide to cancel a listing, simply click the "Cancel" button associated with the credit you wish to remove. Please note that to complete the cancellation process, you will need sufficient gas fees in your wallet. Once canceled, the carbon credits/I-RECs will be removed from your listings and returned to your "Holdings" section.

`,
  },
  {
    title: "How do I check and download the history of my transactions?",
    content: `To check the history of all your transactions, navigate to the "Activity History" section. Here, you'll find a list of cards representing each action, such as purchases made through the marketplace, P2P buying, and cancellations. Each card provides a brief overview of the transaction. Additionally, you can download your transaction history by simply clicking the download icon available on each history card.`,
  },
];

export function FAQ() {
  return (
    <section className="px-4 py-12 md:px-8 lg:py-20">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="mb-10 md:mb-14 text-center">
          <Typography
            variant="h1"
            color="blue-gray"
            className="mb-4 text-3xl md:text-4xl !leading-snug lg:text-[40px]"
          >
            Frequently Asked Questions
          </Typography>
          <Typography className="mx-auto font-normal text-[16px] md:text-[18px] !text-gray-500 lg:max-w-3xl">
            Have questions? We're here to help. Below you'll find answers to
            some common queries.
          </Typography>
        </div>

        {/* Accordion Section */}
        <div className="max-w-3xl mx-auto grid gap-8 md:gap-10">
          {items.map((item, index) => (
            console.log(item),
            <AccordionItem
              key={index}
              index={index + 1}
              title={item.title}
              content={item.content}
              videoUrl={item.videoUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
