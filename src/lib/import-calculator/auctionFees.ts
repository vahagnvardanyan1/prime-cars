/**
 * Auction-specific fees and charges
 * Source: Official auction websites
 * Last updated: 2026-01-17
 */

export type AuctionFees = {
  gateFee: number;
  virtualBidFee: number | ((price: number) => number); // Can be flat or tiered
  liveBidFee?: number | ((price: number) => number); // Can be flat or tiered
  titleShippingFee: number;
  environmentalFee: number;
  securedPaymentFee: number | ((price: number) => number); // Can be flat or percentage-based
};

/**
 * Copart Virtual Bid Fee Structure for Non-Clean Vehicles
 * Source: https://www.copart.com/content/us/en/member-fees-us-licensed-more
 */
const calculateCopartFee = (price: number): number => {
  if (price >= 0 && price <= 49.99) return 1.00;
  if (price >= 50 && price <= 99.99) return 1.00;
  if (price >= 100 && price <= 199.99) return 25.00;
  if (price >= 200 && price <= 299.99) return 60.00;
  if (price >= 300 && price <= 349.99) return 85.00;
  if (price >= 350 && price <= 399.99) return 100.00;
  if (price >= 400 && price <= 449.99) return 125.00;
  if (price >= 450 && price <= 499.99) return 135.00;
  if (price >= 500 && price <= 549.99) return 145.00;
  if (price >= 550 && price <= 599.99) return 155.00;
  if (price >= 600 && price <= 699.99) return 170.00;
  if (price >= 700 && price <= 799.99) return 195.00;
  if (price >= 800 && price <= 899.99) return 215.00;
  if (price >= 900 && price <= 999.99) return 230.00;
  if (price >= 1000 && price <= 1199.99) return 250.00;
  if (price >= 1200 && price <= 1299.99) return 270.00;
  if (price >= 1300 && price <= 1399.99) return 285.00;
  if (price >= 1400 && price <= 1499.99) return 300.00;
  if (price >= 1500 && price <= 1599.99) return 315.00;
  if (price >= 1600 && price <= 1699.99) return 330.00;
  if (price >= 1700 && price <= 1799.99) return 350.00;
  if (price >= 1800 && price <= 1999.99) return 370.00;
  if (price >= 2000 && price <= 2399.99) return 390.00;
  if (price >= 2400 && price <= 2499.99) return 425.00;
  if (price >= 2500 && price <= 2999.99) return 460.00;
  if (price >= 3000 && price <= 3499.99) return 505.00;
  if (price >= 3500 && price <= 3999.99) return 555.00;
  if (price >= 4000 && price <= 4499.99) return 600.00;
  if (price >= 4500 && price <= 4999.99) return 625.00;
  if (price >= 5000 && price <= 5499.99) return 650.00;
  if (price >= 5500 && price <= 5999.99) return 675.00;
  if (price >= 6000 && price <= 6499.99) return 700.00;
  if (price >= 6500 && price <= 6999.99) return 720.00;
  if (price >= 7000 && price <= 7499.99) return 755.00;
  if (price >= 7500 && price <= 7999.99) return 775.00;
  if (price >= 8000 && price <= 8499.99) return 800.00;
  if (price >= 8500 && price <= 8999.99) return 820.00;
  if (price >= 9000 && price <= 9999.99) return 820.00;
  if (price >= 10000 && price <= 10499.99) return 850.00;
  if (price >= 10500 && price <= 10999.99) return 850.00;
  if (price >= 11000 && price <= 11499.99) return 850.00;
  if (price >= 11500 && price <= 11999.99) return 860.00;
  if (price >= 12000 && price <= 12499.99) return 875.00;
  if (price >= 12500 && price <= 14999.99) return 890.00;
  
  // $15,000 and above: 6.00% of price
  if (price >= 15000) return price * 0.06;
  
  return 0;
};

/**
 * Copart Live Bid Fee Structure for Non-Clean Vehicles
 * Source: https://www.copart.com/content/us/en/member-fees-us-licensed-more
 */
const calculateCopartLiveBidFee = (price: number): number => {
  if (price >= 0 && price <= 100) return 0; // FREE
  if (price >= 100.01 && price <= 500) return 50.00;
  if (price >= 500.01 && price <= 1000) return 65.00;
  if (price >= 1000.01 && price <= 1500) return 85.00;
  if (price >= 1500.01 && price <= 2000) return 95.00;
  if (price >= 2000.01 && price <= 4000) return 110.00;
  if (price >= 4000.01 && price <= 6000) return 125.00;
  if (price >= 6000.01 && price <= 8000) return 145.00;
  if (price >= 8000.01) return 160.00;
  
  return 0;
};

/**
 * Copart Fees (US Licensed - Non-Clean Vehicles)
 * Source: https://www.copart.com/content/us/en/member-fees-us-licensed-more
 * Section: Non-Clean Vehicles
 * Last Updated: 2026-01-17
 */
export const COPART_FEES: AuctionFees = {
  gateFee: 95, // Gate Fee
  virtualBidFee: calculateCopartFee, // Tiered virtual bid fee based on vehicle price
  liveBidFee: calculateCopartLiveBidFee, // Tiered live bid fee based on vehicle price
  titleShippingFee: 20, // Title Shipping Fee
  environmentalFee: 15, // Environmental Fee
  securedPaymentFee: (price: number) => price * 0.015, // 1.5% secured payment fee
};

/**
 * IAAI Standard Volume Fee Structure
 * Source: IAAI member fees
 */
const calculateIAAIStandardVolumeFee = (price: number): number => {
  if (price >= 0 && price <= 99.99) return 1.00;
  if (price >= 100 && price <= 199.99) return 25.00;
  if (price >= 200 && price <= 299.99) return 60.00;
  if (price >= 300 && price <= 349.99) return 85.00;
  if (price >= 350 && price <= 399.99) return 100.00;
  if (price >= 400 && price <= 449.99) return 125.00;
  if (price >= 450 && price <= 499.99) return 135.00;
  if (price >= 500 && price <= 549.99) return 145.00;
  if (price >= 550 && price <= 599.99) return 155.00;
  if (price >= 600 && price <= 699.99) return 170.00;
  if (price >= 700 && price <= 799.99) return 195.00;
  if (price >= 800 && price <= 899.99) return 215.00;
  if (price >= 900 && price <= 999.99) return 230.00;
  if (price >= 1000 && price <= 1199.99) return 250.00;
  if (price >= 1200 && price <= 1299.99) return 270.00;
  if (price >= 1300 && price <= 1399.99) return 285.00;
  if (price >= 1400 && price <= 1499.99) return 300.00;
  if (price >= 1500 && price <= 1599.99) return 315.00;
  if (price >= 1600 && price <= 1699.99) return 330.00;
  if (price >= 1700 && price <= 1799.99) return 350.00;
  if (price >= 1800 && price <= 1999.99) return 370.00;
  if (price >= 2000 && price <= 2399.99) return 390.00;
  if (price >= 2400 && price <= 2499.99) return 425.00;
  if (price >= 2500 && price <= 2999.99) return 460.00;
  if (price >= 3000 && price <= 3499.99) return 505.00;
  if (price >= 3500 && price <= 3999.99) return 555.00;
  if (price >= 4000 && price <= 4499.99) return 600.00;
  if (price >= 4500 && price <= 4999.99) return 625.00;
  if (price >= 5000 && price <= 5499.99) return 650.00;
  if (price >= 5500 && price <= 5999.99) return 675.00;
  if (price >= 6000 && price <= 6499.99) return 700.00;
  if (price >= 6500 && price <= 6999.99) return 720.00;
  if (price >= 7000 && price <= 7499.99) return 755.00;
  if (price >= 7500 && price <= 7999.99) return 775.00;
  if (price >= 8000 && price <= 8499.99) return 800.00;
  if (price >= 8500 && price <= 9999.99) return 820.00;
  if (price >= 10000 && price <= 11499.99) return 850.00;
  if (price >= 11500 && price <= 11999.99) return 860.00;
  if (price >= 12000 && price <= 12499.99) return 875.00;
  if (price >= 12500 && price <= 14999.99) return 890.00;
  
  // $15,000 and above: 6.0% of price
  if (price >= 15000) return price * 0.06;
  
  return 0;
};

/**
 * IAAI Live Online Bid Fee Structure
 * Source: IAAI member fees
 */
const calculateIAAILiveBidFee = (price: number): number => {
  if (price >= 0 && price <= 99.99) return 0;
  if (price >= 100 && price <= 499.99) return 50.00;
  if (price >= 500 && price <= 999.99) return 65.00;
  if (price >= 1000 && price <= 1499.99) return 85.00;
  if (price >= 1500 && price <= 1999.99) return 95.00;
  if (price >= 2000 && price <= 3999.99) return 110.00;
  if (price >= 4000 && price <= 5999.99) return 125.00;
  if (price >= 6000 && price <= 7999.99) return 145.00;
  if (price >= 8000) return 160.00;
  
  return 0;
};

/**
 * IAAI Fees (Insurance Auto Auctions)
 * Source: IAAI member fees
 * Last Updated: 2026-01-17
 */
export const IAAI_FEES: AuctionFees = {
  gateFee: 95, // Service Fee
  virtualBidFee: calculateIAAIStandardVolumeFee, // Standard Volume Fee
  liveBidFee: calculateIAAILiveBidFee, // Live Online Bid Fee
  titleShippingFee: 20, // Title-Handling Fee
  environmentalFee: 15, // Environmental Fee
  securedPaymentFee: 0,
};

/**
 * Manheim Fees
 * TODO: Add Manheim fee structure
 */
export const MANHEIM_FEES: AuctionFees = {
  gateFee: 0,
  virtualBidFee: 0,
  titleShippingFee: 0,
  environmentalFee: 0,
  securedPaymentFee: 0,
};

/**
 * Calculate total auction fees based on selected auction
 */
export const calculateAuctionFees = ({
  auction,
  vehiclePrice,
  useLiveBid = false,
}: {
  auction: "copart" | "iaai" | "manheim" | "other";
  vehiclePrice: number;
  useLiveBid?: boolean;
}): {
  gateFee: number;
  bidFee: number;
  virtualBidFee: number;
  liveBidFee: number;
  titleShippingFee: number;
  environmentalFee: number;
  securedPaymentFee: number;
  totalFees: number;
} => {
  let fees: AuctionFees;

  switch (auction.toLowerCase()) {
    case "copart":
      fees = COPART_FEES;
      break;
    case "iaai":
      fees = IAAI_FEES;
      break;
    case "manheim":
      fees = MANHEIM_FEES;
      break;
    default:
      // Default/other auctions - no fees
      return {
        gateFee: 0,
        bidFee: 0,
        virtualBidFee: 0,
        liveBidFee: 0,
        titleShippingFee: 0,
        environmentalFee: 0,
        securedPaymentFee: 0,
        totalFees: 0,
      };
  }

  // Calculate virtual bid fee (Non-Clean Title Fee)
  const virtualBidFeeValue = typeof fees.virtualBidFee === "function"
    ? fees.virtualBidFee(vehiclePrice)
    : fees.virtualBidFee;
  
  // Calculate live bid fee
  const liveBidFeeValue = fees.liveBidFee
    ? typeof fees.liveBidFee === "function"
      ? fees.liveBidFee(vehiclePrice)
      : fees.liveBidFee
    : 0;
  
  const bidFee = useLiveBid ? liveBidFeeValue : virtualBidFeeValue;
  
  // Calculate secured payment fee (can be percentage-based)
  const securedPaymentFee = typeof fees.securedPaymentFee === "function"
    ? fees.securedPaymentFee(vehiclePrice)
    : fees.securedPaymentFee;

  const totalFees =
    fees.gateFee +
    bidFee +
    fees.titleShippingFee +
    fees.environmentalFee +
    securedPaymentFee;

  return {
    gateFee: fees.gateFee,
    bidFee,
    virtualBidFee: virtualBidFeeValue,
    liveBidFee: liveBidFeeValue,
    titleShippingFee: fees.titleShippingFee,
    environmentalFee: fees.environmentalFee,
    securedPaymentFee,
    totalFees,
  };
};

/**
 * Calculate service fee based on vehicle price (in USD)
 * Tiered structure up to $50,000, then 1.5% for amounts above
 */
export const calculateServiceFee = (price: number): number => {
  if (price <= 0) return 0;
  if (price <= 7500) return 300;
  if (price <= 10000) return 325;
  if (price <= 12500) return 350;
  if (price <= 15000) return 375;
  if (price <= 17500) return 400;
  if (price <= 20000) return 425;
  if (price <= 22500) return 450;
  if (price <= 25000) return 475;
  if (price <= 27500) return 500;
  if (price <= 30000) return 525;
  if (price <= 32500) return 550;
  if (price <= 35000) return 575;
  if (price <= 37500) return 600;
  if (price <= 40000) return 625;
  if (price <= 42500) return 650;
  if (price <= 45000) return 675;
  if (price <= 47500) return 700;
  if (price <= 50000) return 725;
  
  // For amounts over $50,000, calculate 1.5%
  return price * 0.015;
};
