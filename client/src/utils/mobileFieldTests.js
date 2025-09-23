// Quick test to verify mobile field flag display
console.log("🧪 Testing Mobile Number Field Flag Display...");

// Test flag emoji support
const testFlagDisplay = () => {
  console.log("🇦🇷 Argentina flag emoji test");
  console.log("If you see the flag above, emoji support is working correctly");

  // Check if the mobile field is properly styled
  const mobileField = document.querySelector(".mobile-number-field__flag");
  if (mobileField) {
    const computedStyle = getComputedStyle(mobileField);
    console.log("Mobile field flag styles:");
    console.log("- Font family:", computedStyle.fontFamily);
    console.log("- Font size:", computedStyle.fontSize);
    console.log("- Display:", computedStyle.display);
  } else {
    console.log(
      "Mobile field not found - make sure to navigate to registration page"
    );
  }
};

// Test input field font consistency
const testInputConsistency = () => {
  const mobileInput = document.querySelector(".mobile-number-field__input");
  const regularInput = document.querySelector(".form-field__input");

  if (mobileInput && regularInput) {
    const mobileStyle = getComputedStyle(mobileInput);
    const regularStyle = getComputedStyle(regularInput);

    console.log("\n📱 Input Field Font Consistency Check:");
    console.log("Mobile field font:", mobileStyle.fontFamily);
    console.log("Regular field font:", regularStyle.fontFamily);
    console.log(
      "✅ Fonts match:",
      mobileStyle.fontFamily === regularStyle.fontFamily ? "YES" : "NO"
    );
  } else {
    console.log(
      "Input fields not found - navigate to registration page to test"
    );
  }
};

if (import.meta.env.DEV) {
  window.testFlagDisplay = testFlagDisplay;
  window.testInputConsistency = testInputConsistency;

  // Auto-run tests if on registration page
  setTimeout(() => {
    if (
      window.location.pathname.includes("register") ||
      document.querySelector(".mobile-number-field")
    ) {
      testFlagDisplay();
      testInputConsistency();
    }
  }, 1000);
}
