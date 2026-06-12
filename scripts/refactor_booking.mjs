import fs from 'fs';

const filePath = './components/BookingFlow.tsx';
const content = fs.readFileSync(filePath, 'utf-8');

// Find the start of the types and the end of handleSubmit
const startMarker = 'type Experience = {';
const endMarker = '    }\n  };\n';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);

  const replacement = `import { useBookingFlow } from "@/hooks/useBookingFlow";

export default function BookingFlow() {
  const {
    step, setStep, experiences, settings, loading,
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    players, setPlayers, selectedExperience, setSelectedExperience,
    filterType, setFilterType,
    firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone,
    acceptedTerms, setAcceptedTerms, acceptedNewsletter, setAcceptedNewsletter,
    paymentType, setPaymentType, isSubmitting, bookingComplete,
    discountCodeInput, setDiscountCodeInput, appliedDiscount, validatingDiscount,
    discountError, discountMessage,
    globalPricing, bookedTimes, loadingTimes, availableTimes,
    pricePerPerson, rawTotalPrice, discountAmount, totalPrice, amountToPay,
    handleApplyDiscount, handleNext, handleBack, handleSubmit
  } = useBookingFlow();
`;

  fs.writeFileSync(filePath, before + replacement + after);
  console.log('Refactored BookingFlow.tsx successfully.');
} else {
  console.error('Could not find markers.');
}
