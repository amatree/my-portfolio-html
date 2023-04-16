document.addEventListener("DOMContentLoaded", initialize);

var navElement = null;
var navElementStyles = null;
var navTexts = null;
var navNavigation = null;
var navNavigationInnerHTML = null;
var navHamburger = null;
var navHamburgerShown = false;

var allSections = null;
var currSection = null;

var mainSection = null;
var mainSectionBgVisualCircles = null;
var defaultMainSectionBgVisualCirclePositions = [];

var viewportHeight = window.innerHeight;
var viewportWidth = window.innerWidth;
var scrollDirection = "down";

var storage = {};

const NAV_HEIGHT_SCALE = 0.65;

async function initialize() {
	allSections = document.querySelectorAll("section");
	currSection = getSnappedSection();

	mainSection = document.getElementById("main");
	mainSectionBgVisualCircles = mainSection.querySelectorAll(
		"svg#bg-visual g > circle"
	);
	mainSectionBgVisualCircles.forEach(function (cir) {
		const s = getStyles(cir);
		const cx = s.cx;
		const cy = s.cy;
		defaultMainSectionBgVisualCirclePositions.push({
			cx: parseInt(cx.replace("px", "")),
			cy: parseInt(cy.replace("px", ""))
		});
	});

	// retrieve variables from *
	storage["vars"] = getCssVariables();

	// set all selector variables
	navElement = document.querySelector("nav");
	navElementStyles = getStyles(navElement);
	navTexts = document.querySelectorAll("nav ul a");
	navNavigation = document.querySelector("nav ul[id='navigation']");
	navNavigationInnerHTML = navNavigation.innerHTML;
	navHamburger = document.querySelector("nav ul[id='hamburger']");
	// define event listeners
	// scroll handle
	window.addEventListener("scroll", (e) => {
		handleScroll(e);
	});
	// for mobile
	window.addEventListener("touchmove", (e) => {
		handleScroll(e);
	});

	// nav hamburger click
	navHamburger.addEventListener("click", () => {
		handleNavHamburger();
	});

	// navNavigation.addEventListener("mouseover", (e) => {
	// 	console.log(e.target)
	// })

	// check for scrolling direction
	window.addEventListener("wheel", (event) => {
		if (event.wheelDelta < 0 && scrollDirection != "down") {
			// User is scrolling down
			scrollDirection = "down";
		} else if (event.wheelDelta > 0 && scrollDirection != "up") {
			// User is scrolling up
			scrollDirection = "up";
		}
	});

	// check if window is resized, then update the viewport width and height
	window.addEventListener("resize", () => {
		viewportHeight = window.innerHeight;
		viewportWidth = window.innerWidth;
	});
}

async function handleNavHamburger() {
	if (navHamburgerShown) {
		document.documentElement.style.setProperty(
			"--nav-hamburger-opt-display",
			"flex"
		);
		document
			.querySelector("div[class='hamburger-menu']")
			.classList.add("closed");
		setTimeout(() => {
			navNavigation.innerHTML = navNavigationInnerHTML;
			document.documentElement.style.setProperty("--nav-opt-display", "none");
		}, 400);
	} else {
		// show hamburger menu
		document.documentElement.style.setProperty(
			"--nav-hamburger-opt-display",
			"none"
		);
		document.documentElement.style.setProperty("--nav-opt-display", "flex");
		document
			.querySelector("div[class='hamburger-menu closed']")
			?.classList.remove("closed");
		navNavigation.innerHTML = `<div class="hamburger-menu"><span class="hide-sidenav">>></span><h5>Menu</h5>${navNavigationInnerHTML}</div>`;
		// handle closing hamburger
		document.querySelector(".hide-sidenav").addEventListener("click", () => {
			handleNavHamburger();
		});
	}

	navHamburgerShown = !navHamburgerShown;
}

function handleScroll(e) {
	// make sure event type is scroll only (not resize or others)
	if (e.type !== "scroll") return;

	currSection = getSnappedSection();
	const percentageAwayFromMain = round(
		Math.max(1, (100 * (window.scrollY + 100)) / viewportHeight) / 100,
		2
	);
	const NAV_HEIGHT = storage["vars"]["--nav-height"] ? storage["vars"]["--nav-height"].replace("px", "") * NAV_HEIGHT_SCALE : 100;

	// between even section
	const isBetweenEvenSection = !(
		Math.floor((window.scrollY + NAV_HEIGHT) / viewportHeight) % 2
	);

	// animate bg visual for main section
	if (window.scrollY <= NAV_HEIGHT) {
		mainSectionBgVisualCircles.forEach((cir, i) => {
			cir.style.cx = defaultMainSectionBgVisualCirclePositions[i].cx;
			cir.style.cy = defaultMainSectionBgVisualCirclePositions[i].cy;
		});
	} else {
		if (storage["vars"]["bg-visuals-not-in-animation"]) {
			storage["vars"]["bg-visuals-not-in-animation"] = false;
			const randNum = randomNumber(
				0,
				defaultMainSectionBgVisualCirclePositions.length - 1,
			);
			const randOffsetX = randomNumber(-300, 300);
			const randOffsetY = randomNumber(-50, 50);
			const newCx = defaultMainSectionBgVisualCirclePositions[randNum]?.cx + randOffsetX;
			const newCy = defaultMainSectionBgVisualCirclePositions[randNum]?.cy + randOffsetY;
			mainSectionBgVisualCircles[randNum].style.cx = newCx;
			mainSectionBgVisualCircles[randNum].style.cy = newCy;
		} else {
			setTimeout(() => {
				storage["vars"]["bg-visuals-not-in-animation"] = true;
			}, 800);
		}
	}

	// check if page Y is still in the main section
	// if not, adjust box-shadow and other properties
	if (window.scrollY + NAV_HEIGHT <= viewportHeight) {
		changeToDefNav();
		navElement.style.maxHeight = storage["vars"]["--nav-height"];
	} else {
		if (isBetweenEvenSection) {
			changeToDefNav();
		} else {
			changeToLightNav();
		}

		// scale it down as well
		navElement.style.maxHeight =
			storage["vars"]["--nav-height"] ? parseInt(storage["vars"]["--nav-height"].replace("px")) *
				NAV_HEIGHT_SCALE +
				"px" : "100px";
	}

	function changeToDefNav() {
		// reset all changed properties to default
		if (window.scrollY > 10) {
			navElement.style.boxShadow = storage["vars"]["--box-shadow-short"];
		} else {
			navElement.style.boxShadow = "none";
		}
		navElement.style.backgroundColor = storage["vars"]["--clr-accent"];
		setStyleElements(navTexts, {
			color: storage["vars"]["--clr-font"]
		});
		navTexts[navTexts.length - 1].style.color = storage["vars"]["--clr-font"];
		navHamburger.style.fill = storage["vars"]["--clr-font"];
		navHamburger.style.stroke = storage["vars"]["--clr-font"];
	}

	function changeToLightNav() {
		navElement.style.backgroundColor = storage["vars"]["--clr-primary"];
		navTexts[navTexts.length - 1].style.color =
			storage["vars"]["--clr-font-dark"];
		setStyleElements(navTexts, {
			color: storage["vars"]["--clr-font-dark"]
		});
		navHamburger.style.fill = storage["vars"]["--clr-font-dark"];
		navHamburger.style.stroke = storage["vars"]["--clr-font-dark"];
	}
}

function setStyleElements(elements, styles = {}) {
	if (elements)
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			Object.entries(styles).forEach(([o_style, value]) => {
				element.style[o_style] = value;
			});
		}
}

function getSnappedSection() {
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

function hexToRgb(hex = "") {
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

function getCssVariables(element = null) {
	// return all css variables when element is not specified
	if (!element) {
		const mainSheet = Array.from(document.styleSheets).filter((sheet) =>
			sheet.href.endsWith(".css")
		);
		const vars = mainSheet.reduce(
			(acc, sheet) =>
			(acc = [
				...acc,
				...Array.from(sheet.cssRules).reduce(
					(def, rule) =>
					(def =
						rule.selectorText === ":root"
							? [
								...def,
								...Array.from(rule.style).filter((name) =>
									name.startsWith("--")
								)
							]
							: def),
					[]
				)
			]),
			[]
		);
		const computedStyle = window.getComputedStyle(document.documentElement);

		var res = {};
		vars.forEach((e) => {
			res[e] = computedStyle.getPropertyValue(e);
		});

		return res;
	}

	// Get the computed styles of the element
	const styles = window.getComputedStyle(element);
	console.log(styles);

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

function getAllCSSVariableNames(styleSheets = document.styleSheets) {
	var cssVars = [];
	// loop each stylesheet
	for (var i = 0; i < styleSheets.length; i++) {
		// loop stylesheet's cssRules
		try {
			// try/catch used because 'hasOwnProperty' doesn't work
			for (var j = 0; j < styleSheets[i].cssRules.length; j++) {
				try {
					// loop stylesheet's cssRules' style (property names)
					for (var k = 0; k < styleSheets[i].cssRules[j].style.length; k++) {
						let name = styleSheets[i].cssRules[j].style[k];
						// test name for css variable signiture and uniqueness
						if (name.startsWith("--") && cssVars.indexOf(name) == -1) {
							cssVars.push(name);
						}
					}
				} catch (error) { }
			}
		} catch (error) { }
	}
	return cssVars;
}

function randomNumber(min = 0, max = 100, decimal = 0) {
	if (min >= 0) {
		return round(Math.random() * max, decimal);
	}
	const offset = max - min;
	return round(Math.random() * offset - max, decimal);
}
