function setStyleElements(elements, styles = {}) {
	if (elements)
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			Object.entries(styles).forEach(([o_style, value]) => {
				element.style[o_style] = value;
			});
		}
}

function getSnappedSection(allSections) {
	if (allSections)
		// loop through all section elements
		for (let i = 0; i < allSections.length; i++) {
			const section = allSections[i];
			const rect = section.getBoundingClientRect();

			// Check if the section is snapped to the top of the viewport
			if (rect.top === 0) return section.id;
		}
	return null;
}

function getStyles(element) {
	return window.getComputedStyle(element);
}

function round(n, decimal = 2) {
	return Math.round(n * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

function convertToHex(value) {
	// Multiply the value by 255 and round it to the nearest integer
	const intValue = Math.round(value * 255);

	// Convert the integer to a hex string with a minimum width of 2
	const hexString = intValue.toString(16).padStart(2, "0");

	// Return the hex string
	return hexString;
}

function hexToRgb(hex = '') {
	// Remove the "#" from the beginning of the hex value
	hex = hex.replace("#", "");

	// Convert the hex value to RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Return the RGB color value
	return `rgb(${r}, ${g}, ${b})`;
}

function interpolateRgbColor(originalColor, finalColor, value) {
	// Parse the original and final colors
	const original = originalColor.match(/\d+/g).map(Number);
	const final = finalColor.match(/\d+/g).map(Number);

	// Interpolate each color channel
	const red = Math.round(original[0] + (final[0] - original[0]) * value);
	const green = Math.round(original[1] + (final[1] - original[1]) * value);
	const blue = Math.round(original[2] + (final[2] - original[2]) * value);

	// Return the interpolated color as an RGB string
	return `rgb(${red}, ${green}, ${blue})`;
}

function interpolate(from, to, value) {
	return from + (to - from) * value;
}

function getCssVariables(element) {
	// Get the computed styles of the element
	const styles = window.getComputedStyle(element);

	// Get all custom properties from the computed styles
	const properties = Array.from(styles).filter((property) =>
		property.startsWith("--")
	);

	// Get the value of each custom property
	const variables = properties.reduce((obj, property) => {
		obj[property] = styles.getPropertyValue(property).trim();
		return obj;
	}, {});

	// Return the object with all custom property values
	return variables;
}

export {
	setStyleElements,
	getSnappedSection,
	getStyles,
	round,
	convertToHex,
	hexToRgb,
	interpolateRgbColor,
	interpolate,
	getCssVariables,
};
