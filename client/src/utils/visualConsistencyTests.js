// Visual consistency test for mobile number field and locality select
export const testVisualConsistency = () => {
  console.log("🎨 Testing Visual Consistency...");

  const mobileField = document.querySelector(".mobile-number-field");
  const localityField = document.querySelector(".locality-select");
  const regularField = document.querySelector(".form-field");

  if (!mobileField || !localityField || !regularField) {
    console.log("⚠️ Fields not found. Navigate to registration page to test.");
    return;
  }

  // Test label styling consistency
  const mobileLabel = mobileField.querySelector(".mobile-number-field__label");
  const localityLabel = localityField.querySelector(".locality-select__label");
  const regularLabel = regularField.querySelector(".form-field__label");

  if (mobileLabel && localityLabel && regularLabel) {
    const mobileStyle = getComputedStyle(mobileLabel);
    const localityStyle = getComputedStyle(localityLabel);
    const regularStyle = getComputedStyle(regularLabel);

    console.log("\n📝 Label Consistency:");
    console.log("Font size:", {
      mobile: mobileStyle.fontSize,
      locality: localityStyle.fontSize,
      regular: regularStyle.fontSize,
      allMatch:
        mobileStyle.fontSize === regularStyle.fontSize &&
        localityStyle.fontSize === regularStyle.fontSize,
    });
    console.log("Font weight:", {
      mobile: mobileStyle.fontWeight,
      locality: localityStyle.fontWeight,
      regular: regularStyle.fontWeight,
      allMatch:
        mobileStyle.fontWeight === regularStyle.fontWeight &&
        localityStyle.fontWeight === regularStyle.fontWeight,
    });
    console.log("Color:", {
      mobile: mobileStyle.color,
      locality: localityStyle.color,
      regular: regularStyle.color,
      allMatch:
        mobileStyle.color === regularStyle.color &&
        localityStyle.color === regularStyle.color,
    });
  }

  // Test input styling consistency
  const mobileWrapper = mobileField.querySelector(
    ".mobile-number-field__input-wrapper"
  );
  const localityInput = localityField.querySelector(".locality-select__input");
  const regularInput = regularField.querySelector(".form-field__input");

  if (mobileWrapper && localityInput && regularInput) {
    const wrapperStyle = getComputedStyle(mobileWrapper);
    const localityStyle = getComputedStyle(localityInput);
    const inputStyle = getComputedStyle(regularInput);

    console.log("\n📱 Input Container Consistency:");
    console.log("Border width:", {
      mobile: wrapperStyle.borderWidth,
      locality: localityStyle.borderWidth,
      regular: inputStyle.borderWidth,
      allMatch:
        wrapperStyle.borderWidth === inputStyle.borderWidth &&
        localityStyle.borderWidth === inputStyle.borderWidth,
    });
    console.log("Border color:", {
      mobile: wrapperStyle.borderColor,
      locality: localityStyle.borderColor,
      regular: inputStyle.borderColor,
      allMatch:
        wrapperStyle.borderColor === inputStyle.borderColor &&
        localityStyle.borderColor === inputStyle.borderColor,
    });
    console.log("Border radius:", {
      mobile: wrapperStyle.borderRadius,
      locality: localityStyle.borderRadius,
      regular: inputStyle.borderRadius,
      allMatch:
        wrapperStyle.borderRadius === inputStyle.borderRadius &&
        localityStyle.borderRadius === inputStyle.borderRadius,
    });
    console.log("Background color:", {
      mobile: wrapperStyle.backgroundColor,
      locality: localityStyle.backgroundColor,
      regular: inputStyle.backgroundColor,
      allMatch:
        wrapperStyle.backgroundColor === inputStyle.backgroundColor &&
        localityStyle.backgroundColor === inputStyle.backgroundColor,
    });
    console.log("Padding:", {
      mobile: wrapperStyle.padding,
      locality: localityStyle.padding,
      regular: inputStyle.padding,
      // Note: mobile input padding might be different due to prefix
    });
  }

  // Test inner input styling
  const mobileInput = mobileField.querySelector(".mobile-number-field__input");

  if (mobileInput && regularInput) {
    const mobileInputStyle = getComputedStyle(mobileInput);
    const regularInputStyle = getComputedStyle(regularInput);

    console.log("\n⌨️ Input Text Consistency:");
    console.log("Font family:", {
      mobile: mobileInputStyle.fontFamily,
      regular: regularInputStyle.fontFamily,
      match: mobileInputStyle.fontFamily === regularInputStyle.fontFamily,
    });
    console.log("Font size:", {
      mobile: mobileInputStyle.fontSize,
      regular: regularInputStyle.fontSize,
      match: mobileInputStyle.fontSize === regularInputStyle.fontSize,
    });
    console.log("Padding:", {
      mobile: mobileInputStyle.padding,
      regular: regularInputStyle.padding,
      // Note: mobile input padding might be different due to prefix
    });
  }

  console.log("\n✨ Visual consistency test completed!");
};

// Test focus states for all components
export const testFocusStates = () => {
  console.log("🎯 Testing Focus States...");

  const mobileWrapper = document.querySelector(
    ".mobile-number-field__input-wrapper"
  );
  const localityInput = document.querySelector(".locality-select__input");
  const regularInput = document.querySelector(".form-field__input");

  if (mobileWrapper && localityInput && regularInput) {
    console.log("📝 Focus test instructions:");
    console.log(
      "1. Click on a regular input field and check border color/shadow"
    );
    console.log(
      "2. Click on the locality select field and check border color/shadow"
    );
    console.log(
      "3. Click on the mobile number field and check border color/shadow"
    );
    console.log("4. All colors and shadows should be identical");
    console.log("5. Expected: Green border (#1b9c3f) with subtle shadow");
  } else {
    console.log("⚠️ Fields not found for focus testing");
  }
};

if (import.meta.env.DEV) {
  window.testVisualConsistency = testVisualConsistency;
  window.testFocusStates = testFocusStates;
}
