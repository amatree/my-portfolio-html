import { modalInnerHTML } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
	initialize();
	// initialize scroll event once when first loaded
	handleScroll({ type: "scroll" });
});

// =======
// This section will initialize all needed variables to null
// in order to prevent possible null errors.
var navElement = null;
var navElementStyles = null;
var navAboutAndProjectsButtons = null;
var navContactButton = null;
var navTexts = null;
var navNavigation = null;
var navNavigationInnerHTML = null;
var navHamburger = null;
var navHamburgerShown = false;

var allSections = null;
var currSection = null;
var sectionsNotMain = null;
var sectionPadding = null;

var footerElement = null;
var navHamburgerInnerHTML = null;

var mainSection = null;
var mainSectionBgVisualCircles = null;
var defaultMainSectionBgVisualCirclePositions = [];

var aboutMeSectionMeImg = null;
var aboutMeSectionBrandLogos = {};
var aboutMeSectionGallery = null;
var aboutMeScriptVars = {
	timer: null,
	logo_timer: null,
	ANIMATION_DELAY: 1500,
	LOGOS_ANIMATION_DELAY: 1000,
};

var projectCardsParent = null;
var projectCardsContainer = null;
var projectCards = null;
var projectCardsMouseDragInfo = {
	isDragging: false,
	startDragX: null,
	endDragX: null,
	slope: 0,
	timer: null,
	TRANSLATION_OFFSET: 100,
	DELAY_BEFORE_DRAG: 500,
	MEDIUM_VIEWPORT_ACTIVATION_WIDTH: 1200,
};

var viewportHeight = window.innerHeight;
var viewportWidth = window.innerWidth;
var sectionLayoutDimensions = {};

var scrollDirection = "down";

var storage = {};

var timers = { SCROLL_DELAY: 0 };
// =======

const modal = modalInnerHTML();

var NAV_HEIGHT = 100;
const NAV_HEIGHT_SCALE = 0.65;

const TEXT_TAGS = [
	"DIV",
	"EM",
	"P",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"B",
	"I",
	"STRONG",
	"MARK",
	"SMALL",
	"SUB",
	"SUP",
	"INS",
	"DEL",
	"Q",
	"BR",
	"SPAN",
];

const SECTION_INDICES = {
	main: 0,
	about: 1,
	projects: 2,
	contact: 3,
};

/**
 * Initialize all needed variables ONCE right after `DOMContentLoaded` event is triggered.
 */
async function initialize() {
	allSections = document.querySelectorAll("section");
	currSection = getSnappedSection();
	sectionsNotMain = document.querySelector("section:not(#main)");
	sectionPadding =
		Number(getStyles(sectionsNotMain)["padding-top"].replace("px", "")) +
		Number(getStyles(sectionsNotMain)["padding-bottom"].replace("px", ""));

	aboutMeSectionMeImg = document.getElementById("abt-me-img");
	aboutMeSectionBrandLogos = document.querySelectorAll(
		"#about-me-content p#banners img"
	);
	aboutMeSectionGallery = document.querySelector(".my-gallery .gallery-img");

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
			cy: parseInt(cy.replace("px", "")),
		});
	});

	footerElement = document.querySelector("footer");

	// this inner html will be shown when the hamburger menu is clicked
	navHamburgerInnerHTML = `
	<div class="nav-hamburger-menu-container">
		<div class="nav-hamburger-menu">
			<div id="hamburger-menu">
				<svg id="collapse-menu-btn" width="131px" height="131px">
					<rect x="65px" y="65px" width="60px" height="1px"></rect>
					<rect x="65px" y="65px" width="60px" height="1px"></rect>
					<rect x="65px" y="65px" width="60px" height="1px"></rect>
					<rect x="65px" y="65px" width="60px" height="1px"></rect>
					<rect x="65px" y="65px" width="1px" height="1px"></rect>
				</svg>
				<a href="#" style="font-weight: 700"><h2>Portfolio</h2></a>
				<div id="navigation">
					<a href="#about"><h4>About</h4></a>
					<a href="#projects"><h4>Projects</h4></a>
					<a href="#contact"><h4>Contact</h4></a>
				</div>
			</div>
		<div id="nav-hamburger-footer">${footerElement.innerHTML}</div>
	</div>`;

	// retrieve variables from *
	storage["vars"] = getCssVariables();

	// set all selector variables
	navElement = document.querySelector("nav");
	navElementStyles = getStyles(navElement);
	navAboutAndProjectsButtons = document.querySelectorAll(
		"nav ul a:is([href='#about'], [href='#projects'])"
	);
	navContactButton = document.querySelector('.nav ul li a[href="#contact"]');
	navTexts = document.querySelectorAll("nav ul a");
	navNavigation = document.querySelector("nav ul[id='navigation']");
	navNavigationInnerHTML = navNavigation.innerHTML;
	navHamburger = document.querySelector("nav ul[id='hamburger']");

	projectCardsParent = document.querySelector("#project-cards");
	projectCardsContainer = document.querySelector("#project-cards-container");
	projectCards = document.querySelectorAll("#project-cards #project-card");
	// manual hover event for project cards
	projectCards.forEach((projectCard) => {
		projectCard.addEventListener("focusin", (event) => {
			setFocusState();
		});
		projectCard.addEventListener("focusout", (event) => {
			setFocusState(false);
		});

		projectCard.addEventListener("mouseenter", (event) => {
			setFocusState();
		});
		projectCard.addEventListener("mouseleave", (event) => {
			setFocusState(false);
		});

		function setFocusState(value = true) {
			if (!projectCardsMouseDragInfo.isDragging && value) {
				projectCard.classList.add("hover");
			} else {
				projectCard.classList.remove("hover");
			}
		}
	});

	// check for form submission
	formSubmissionCheck();

	// finally initialize listener events
	initListeners();
}

/**
 * Declare all event listeners, mainly `scroll`.
 */
function initListeners() {
	// scroll handle
	window.addEventListener("scroll", (e) => {
		if (timers.scrollTimer !== null) {
			clearTimeout(timers.scrollTimer);
		}
		timers.SCROLL_DELAY = 50;
		timers.scrollTimer = setTimeout(() => {
			handleScroll(e);
		}, timers.SCROLL_DELAY);
	});

	// scroll handle for mobile
	window.addEventListener("touchmove", (e) => {
		if (timers.scrollTimer !== null) {
			clearTimeout(timers.scrollTimer);
		}

		timers.SCROLL_DELAY = 25;
		timers.scrollTimer = setTimeout(() => {
			handleScroll(e);
		}, timers.SCROLL_DELAY);
	});

	// nav hamburger click
	navHamburger.addEventListener("click", () => {
		handleNavHamburger();
	});

	// project cards event
	if (
		viewportWidth >= projectCardsMouseDragInfo.MEDIUM_VIEWPORT_ACTIVATION_WIDTH
	) {
		handleProjectCardEvents();
	}

	// for scrolling direction
	window.addEventListener("wheel", (event) => {
		if (event.wheelDelta < 0 && scrollDirection != "down") {
			// User is scrolling down
			scrollDirection = "down";
		} else if (event.wheelDelta > 0 && scrollDirection != "up") {
			// User is scrolling up
			scrollDirection = "up";
		}
	});

	// if window is resized, then update the viewport width and height
	window.addEventListener("resize", () => {
		viewportHeight = window.innerHeight;
		viewportWidth = window.innerWidth;
	});
}

/**
 * Check for `#success` anchor (returned from a successful form submission).
 */
function formSubmissionCheck() {
	if (!urlContains("#success")) return;

	const newURL = window.location.href.replace("#success", "");
	window.history.replaceState({ path: newURL }, "", newURL);
	modal.showModal();
}

/**
 * Simulate hold and drag action for project cards.
 */
function handleProjectCardEvents() {
	// implement scroll dragging for project cards
	projectCardsParent.onmousedown = (event) => {
		projectCardsMouseDragInfo.timer = setTimeout(() => {
			projectCardsMouseDragInfo.startDragX = event.pageX;
			const slope =
				(2 * projectCardsMouseDragInfo.TRANSLATION_OFFSET) / viewportWidth;
			projectCardsMouseDragInfo.slope = slope;
			projectCardsMouseDragInfo.isDragging = true;
			changeCardStylesOnDrag();
		}, projectCardsMouseDragInfo.DELAY_BEFORE_DRAG);
	};

	projectCardsParent.onmousemove = (event) => {
		if (projectCardsMouseDragInfo.isDragging) {
			const deltaMouseX = event.pageX - projectCardsMouseDragInfo.startDragX;
			const percentTranslate =
				deltaMouseX * projectCardsMouseDragInfo.slope -
				event.pageX / viewportWidth;

			// only transform per frame
			window.requestAnimationFrame(() => {
				projectCardsContainer.style.transform = `translateX(${percentTranslate}%)`;
			});
		}
	};

	// add mouse up event to window instead
	window.onmouseup = (event) => {
		projectCardsMouseDragInfo.endDragX = event.pageX;
		projectCardsMouseDragInfo.isDragging = false;
		clearTimeout(projectCardsMouseDragInfo.timer);
		// reset translate

		window.requestAnimationFrame(() => {
			projectCardsContainer.style.transform = `translateX(0%)`;
		});
		window.requestAnimationFrame(() => {
			projectCardsContainer.style.transform = ``;
		});

		changeCardStylesOnDrag(false);
	};

	function changeCardStylesOnDrag(enable = true) {
		if (enable) {
			projectCards.forEach((projectCard) => {
				projectCard.classList.add("non-selectable");
				projectCard.classList.remove("hover");
				projectCard.style.transform = "scale(1)";
				projectCard.style.cursor = "pointer";
			});
			projectCardsParent.style = "overflow-x: scroll;";
		} else {
			projectCards.forEach((projectCard) => {
				projectCard.classList.remove("non-selectable");
				projectCard.style.transform = "initial";
				projectCard.style.cursor = "initial";
			});
			projectCardsParent.style = "";
		}
	}
}

/**
 * Handle various scrolling event for this app:
 * 1. When user scroll pass `main` section, the `nav` element will change its properties.
 * 2. Animate the `bg-visuals` as user scrolls
 * 3. Animate the images and icons in the `about-me` section.
 * 4. Handle dynamically theme change for the `theme-color` property of `<meta>` (not working atm).
 */
function handleScroll(e) {
	// make sure event type is scroll only (not resize or others)
	if (e.type !== "scroll") return;

	// requestAnimationFrame(() => {
	NAV_HEIGHT = navElement.clientHeight;

	// retrieve total padding (top + bottom) of all sections
	sectionPadding =
		Number(getStyles(sectionsNotMain)["padding-top"].replace("px", "")) +
		Number(getStyles(sectionsNotMain)["padding-bottom"].replace("px", ""));

	const sectionAt = getScrollThroughSection(NAV_HEIGHT);
	const isNavInMain = sectionAt.current === "main";
	const isNavInAboutMe = sectionAt.current === "about";
	const isNavInProjects = sectionAt.current === "projects";
	const isNavInContact = sectionAt.current === "contact";

	// adjust meta's theme color using variable
	if (!isNavInMain) {
		updateThemeColor(storage["vars"]["--clr-primary"]);
	} else {
		updateThemeColor(storage["vars"]["--clr-accent"]);
	}

	// highlight <a> tags for better feedback in nav
	if (isNavInAboutMe) {
		navAboutAndProjectsButtons[0].parentElement.style.transform = "scale(1.15)";
		navAboutAndProjectsButtons[0].style.textShadow = "4px 7px 2px #22222211";
	} else {
		navAboutAndProjectsButtons[0].parentElement.style.transform = "";
		navAboutAndProjectsButtons[0].style.textShadow = "";
	}
	if (isNavInProjects) {
		navAboutAndProjectsButtons[1].parentElement.style.transform = "scale(1.15)";
		navAboutAndProjectsButtons[1].style.textShadow = "4px 7px 2px #22222211";
	} else {
		navAboutAndProjectsButtons[1].parentElement.style.transform = "";
		navAboutAndProjectsButtons[1].style.textShadow = "";
	}

	animateMainSectionBg();
	animateNavbarColor();
	animateAboutMeSectionImgHover();

	function animateAboutMeSectionImgHover() {
		// only animate if already at about me section or further down
		if (sectionAt.index < SECTION_INDICES.about) {
			clearTimeout(aboutMeScriptVars.timer);
			clearTimeout(aboutMeScriptVars.logo_timer);
			aboutMeScriptVars.timer = null;
			aboutMeScriptVars.logo_timer = null;

			aboutMeSectionMeImg.classList.remove("hovered");
			aboutMeSectionGallery.classList.remove("hovered");

			aboutMeSectionBrandLogos.forEach((logo) => {
				logo.classList.remove("hovered");
			});

			return;
		}
		if (aboutMeScriptVars.timer === null) {
			aboutMeScriptVars.timer = setTimeout(() => {
				aboutMeSectionMeImg.classList.add("hovered");
				aboutMeSectionGallery.classList.add("hovered");

				aboutMeScriptVars.logo_timer = setTimeout(() => {
					aboutMeSectionBrandLogos.forEach((logo) => {
						logo.classList.add("hovered");
					});
					clearTimeout(aboutMeScriptVars.logo_timer);
				}, aboutMeScriptVars.LOGOS_ANIMATION_DELAY);

				clearTimeout(aboutMeScriptVars.timer);
			}, aboutMeScriptVars.ANIMATION_DELAY);
		}
	}

	function animateNavbarColor() {
		// check if page Y is still in the main section
		// if not, adjust box-shadow and other properties
		if (isNavInMain) {
			changeToDefNav();
			navElement.style.maxHeight = storage["vars"]["--nav-height"];
		} else {
			changeToLightNav();

			// scale it down as well
			navElement.style.maxHeight = "65px";
		}
	}

	function animateMainSectionBg() {
		// animate bg visual for main section
		if (window.scrollY <= NAV_HEIGHT) {
			mainSectionBgVisualCircles.forEach((cir, i) => {
				cir.style.cx = defaultMainSectionBgVisualCirclePositions[i].cx;
				cir.style.cy = defaultMainSectionBgVisualCirclePositions[i].cy;
			});
		} else {
			if (storage["vars"]["bg-visuals-not-in-animation"]) {
				storage["vars"]["bg-visuals-not-in-animation"] = false;
				// randomly move circles around
				const randNum = randomNumber(
					0,
					defaultMainSectionBgVisualCirclePositions.length - 1
				);
				const randOffsetX = randomNumber(-300, 300);
				const randOffsetY = randomNumber(-50, 50);
				const newCx =
					defaultMainSectionBgVisualCirclePositions[randNum]?.cx + randOffsetX;
				const newCy =
					defaultMainSectionBgVisualCirclePositions[randNum]?.cy + randOffsetY;
				mainSectionBgVisualCircles[randNum].style.cx = newCx;
				mainSectionBgVisualCircles[randNum].style.cy = newCy;
			} else {
				setTimeout(() => {
					storage["vars"]["bg-visuals-not-in-animation"] = true;
				}, 800);
			}
		}
	}

	function changeToDefNav() {
		// reset all changed properties to default
		navElement.classList.remove("light-nav");
		navElement.classList.add("default-nav");
	}

	function changeToLightNav() {
		navElement.classList.remove("default-nav");
		navElement.classList.add("light-nav");
	}
	// });
}

/**
 * Handle the `nav` hamburger menu animations and events
 */
async function handleNavHamburger() {
	// retrieve animation delay
	const navHamburgerAnimationDelay = timePropertyToSeconds(
		storage["vars"]["--nav-hamburger-menu-animation-delay"]
	);

	if (navHamburgerShown) {
		document.documentElement.style.setProperty(
			"--nav-hamburger-opt-display",
			"flex"
		);

		// add closed class to hamburger-menu
		document
			.querySelector(".nav-hamburger-menu-container")
			.classList.add("closed");

		// delay before set hamburger-menu display to none
		setTimeout(() => {
			navNavigation.innerHTML = navNavigationInnerHTML;
			document.documentElement.style.setProperty("--nav-opt-display", "none");
		}, navHamburgerAnimationDelay);
	} else {
		// show hamburger menu
		document.documentElement.style.setProperty(
			"--nav-hamburger-opt-display",
			"none"
		);
		document.documentElement.style.setProperty("--nav-opt-display", "flex");
		document
			.querySelector(".nav-hamburger-menu-container.closed")
			?.classList.remove("closed");
		navNavigation.innerHTML = navHamburgerInnerHTML;

		// handle closing hamburger
		document
			.querySelector("#collapse-menu-btn")
			.addEventListener("click", () => {
				handleNavHamburger();
			});

		document.querySelectorAll(".nav-hamburger-menu a").forEach((tag) => {
			tag.addEventListener("click", () => {
				// recall this function to hide the nav-hamburger-menu
				// if any <a> is clicked
				handleNavHamburger();
			});
		});
	}

	// switch state of the nav hamburger
	navHamburgerShown = !navHamburgerShown;
}

// helper functions

/**
 * Convert the read time property (e.g. `element.style.animationDelay`) to ms.
 */
function timePropertyToSeconds(value) {
	return value.contains("ms")
		? Number(value.replace(/[^\d\.]/g, ""))
		: Number(value.replace(/[^\d\.]/g, "")) * 1000;
}

/**
 * Set a CSS variable using `style.cssText` property.
 */
function setCSSVariable(varName, value) {
	const rootElement = document.querySelector(":root");
	var cssTextArray = rootElement.style.cssText.split(";");
	if (cssTextArray !== undefined && cssTextArray.length > 1) {
		cssTextArray.forEach((val, idx) => {
			if (val && val.contains(varName)) {
				cssTextArray.splice(idx, 1);
			}
		});
	}
	rootElement.style.cssText += `${varName}: ${value};`;
}

/**
 * Set styles for multiple elements.
 */
function setStyleElements(elements, styles = {}) {
	if (elements)
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			Object.entries(styles).forEach(([o_style, value]) => {
				element.style[o_style] = value;
			});
		}
}

/**
 * Retrieve layout dimensions of each section to `sectionLayoutDimensions`.
 */
function measureSectionDimensions() {
	// property: [id, width, height, relativeTop]
	// relativeTop: element top position relative to the top of the document
	allSections.forEach((section) => {
		const rect = section.getBoundingClientRect();
		const relativeTop = rect.top + rect.height;
		const sectionStyles = getStyles(section);

		sectionLayoutDimensions[section.id] = {
			width: section.clientWidth,
			height: section.clientHeight,
			relativeTop: relativeTop,
			style: {
				backgroundColor: sectionStyles.backgroundColor,
				color: sectionStyles.color,
			},
		};
	});
}

/**
 * Return an object that indicates what section is currently at. The object variables are as follow:\
 * 	- `current`: the `name` of the `<section>`\
 * 	- `index`: iteration count\
 * 	- `style`: the style of the current `<section>`
 */
function getScrollThroughSection(offset = 0) {
	measureSectionDimensions();
	let idx = 0;
	for (const dim in sectionLayoutDimensions) {
		const section = sectionLayoutDimensions[dim];
		if (section.relativeTop >= sectionPadding / 2 + NAV_HEIGHT - offset)
			return { current: dim, index: idx, style: section.style };
		idx++;
	}
	return {
		current: "main",
		index: 0,
		style: sectionLayoutDimensions["main"].style,
	};
}

/**
 * Returns the `id` of whatever `<section>` is at `top = 0` of the viewport.
 */
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

/**
 * Retrieve the computed style of an `element`.
 */
function getStyles(element) {
	return window.getComputedStyle(element);
}

/**
 * Round a number `n` to the specify decimal.
 */
function round(n, decimal = 2) {
	return Math.round(n * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

/**
 * Convert a number between 0-1 to its hex representation.
 */
function convertToHex(value) {
	const intValue = Math.round(value * 255);
	const hexString = intValue.toString(16).padStart(2, "0");
	return hexString;
}

/**
 * Convert a hex color to its corresponding rgb() color for CSS.
 */
function hexToRgb(hex = "") {
	hex = hex.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Interpolate rgb color of `originalColor` to `finalColor` with a factor of `value`.
 */
function interpolateRgbColor(originalColor, finalColor, value) {
	const original = originalColor.match(/\d+/g).map(Number);
	const final = finalColor.match(/\d+/g).map(Number);

	const red = Math.round(original[0] + (final[0] - original[0]) * value);
	const green = Math.round(original[1] + (final[1] - original[1]) * value);
	const blue = Math.round(original[2] + (final[2] - original[2]) * value);
	return `rgb(${red}, ${green}, ${blue})`;
}

function interpolate(from, to, value) {
	return from + (to - from) * value;
}

/**
 * Retrieve all CSS variables (starts with `--`) from the `element`.
 */
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
											),
									  ]
									: def),
						[]
					),
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

/**
 * Retrieve the name of all the CSS variable in an `element`.
 */
function getAllCSSVariableNames(styleSheets = document.styleSheets) {
	var cssVars = [];
	// loop each stylesheet
	for (var i = 0; i < styleSheets.length; i++) {
		try {
			for (var j = 0; j < styleSheets[i].cssRules.length; j++) {
				try {
					// loop stylesheet's cssRules' style (property names)
					for (var k = 0; k < styleSheets[i].cssRules[j].style.length; k++) {
						let name = styleSheets[i].cssRules[j].style[k];
						if (name.startsWith("--") && cssVars.indexOf(name) == -1) {
							cssVars.push(name);
						}
					}
				} catch (error) {}
			}
		} catch (error) {}
	}
	return cssVars;
}

/**
 * Return a random number between `min` and `max`. In addition, `decimal` can
 * also be set if you want to have decimal numbers.
 */
function randomNumber(min = 0, max = 100, decimal = 0) {
	if (min >= 0) {
		return round(Math.random() * max, decimal);
	}
	const offset = max - min;
	return round(Math.random() * offset - max, decimal);
}

/**
 * Returns `true` if the url contains the `str`.
 */
function urlContains(str) {
	return window.location.href.indexOf(str) > -1;
}

/**
 * Set the `content` value of the `<meta name="theme-color">` tag.
 * This is mainly for mobile in order to dynamically modify the status/url bar color.
 * Currently not working as intented.
 */
function updateThemeColor(themeColor) {
	document
		.querySelector('meta[name="theme-color"]')
		.setAttribute("content", themeColor);

	// Request animation frame to trigger UI update
	window.requestAnimationFrame(() => {
		document.body.style.backgroundColor = themeColor;
		document.body.style.backgroundColor = "";
	});
}
