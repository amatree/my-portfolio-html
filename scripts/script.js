import { modalInnerHTML } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
	initialize();
	// initialize scroll event once when first loaded
	handleScroll({ type: "scroll" });
});

var metaThemeColor = null;

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

var timers = { SCROLL_DELAY: 50 };

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

async function initialize() {
	metaThemeColor = document.querySelector('meta[name="theme-color"]');

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

function initListeners() {
	// define event listeners
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

function formSubmissionCheck() {
	if (!urlContains("#success")) return;

	const newURL = window.location.href.replace("#success", "");
	window.history.replaceState({ path: newURL }, "", newURL);
	modal.showModal();
}

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

function handleScroll(e) {
	// make sure event type is scroll only (not resize or others)
	if (e.type !== "scroll") return;

	NAV_HEIGHT = navElement.clientHeight;

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
		metaThemeColor.setAttribute("content", storage['vars']["--clr-primary"]);
	} else {
		metaThemeColor.setAttribute("content", storage['vars']["--clr-accent"]);
	}

	// highlight <a> tags for better feedback in nav
	if (isNavInAboutMe) {
		navAboutAndProjectsButtons[0].parentElement.style.transform = 'scale(1.1)';
		navAboutAndProjectsButtons[0].style.textShadow = '4px 7px 2px #22222211';
	} else {
		navAboutAndProjectsButtons[0].parentElement.style.transform = '';
		navAboutAndProjectsButtons[0].style.textShadow = '';
	}
	if (isNavInProjects) {
		navAboutAndProjectsButtons[1].parentElement.style.transform = 'scale(1.1)';
		navAboutAndProjectsButtons[1].style.textShadow = '4px 7px 2px #22222211';
	} else {
		navAboutAndProjectsButtons[1].parentElement.style.transform = '';
		navAboutAndProjectsButtons[1].style.textShadow = '';
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
		const navTransition = timePropertyToSeconds(
			storage["vars"]["--nav-transition"]
		);

		// reset all changed properties to default
		navElement.style.animation = "navOut forwards ease var(--nav-transition)";

		setTimeout(() => {
			navElement.classList.remove("fixed-nav");
			navElement.classList.add("default-nav");
			navElement.style.animation = "";
		}, navTransition);

		navElement.style.boxShadow = "none";
		navElement.style.backgroundColor = "transparent";

		// change nav text color
		navTexts[0].style.color = storage["vars"]["--clr-font"];

		// change hover font
		setCSSVariable(
			"--clr-font-before-hover",
			storage["vars"]["--clr-font-before-hover"]
		);
		setCSSVariable("--clr-font-hover", storage["vars"]["--clr-font"]);

		// change nav hamburger as well
		navHamburger.style.fill = storage["vars"]["--clr-font"];
		navHamburger.style.stroke = storage["vars"]["--clr-font"];
	}

	function changeToLightNav() {
		navElement.classList.remove("default-nav");
		navElement.classList.add("fixed-nav");
		navElement.style.boxShadow = storage["vars"]["--box-shadow-short"];
		navElement.style.backgroundColor = storage["vars"]["--clr-primary"];

		// change portfolio text color
		navTexts[0].style.color = storage["vars"]["--clr-font-dark"];

		// change hover font
		setCSSVariable(
			"--clr-font-before-hover",
			storage["vars"]["--clr-font-dark-before-hover"]
		);
		setCSSVariable("--clr-font-hover", storage["vars"]["--clr-font-dark"]);

		// change nav hamburger as well
		navHamburger.style.fill = storage["vars"]["--clr-font-dark"];
		navHamburger.style.stroke = storage["vars"]["--clr-font-dark"];
	}
}

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
				handleNavHamburger();
			});
		});
	}

	navHamburgerShown = !navHamburgerShown;
}

// helper functions
function timePropertyToSeconds(value) {
	return value.contains("ms")
		? Number(
				storage["vars"]["--nav-hamburger-menu-animation-delay"].replace(
					/[^\d\.]/g,
					""
				)
		  )
		: Number(
				storage["vars"]["--nav-hamburger-menu-animation-delay"].replace(
					/[^\d\.]/g,
					""
				)
		  ) * 1000;
}

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

function setStyleElements(elements, styles = {}) {
	if (elements)
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			Object.entries(styles).forEach(([o_style, value]) => {
				element.style[o_style] = value;
			});
		}
}

function measureSectionDimensions() {
	// get layout dimensions of each section
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
						// test name for css variable signature and uniqueness
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

function randomNumber(min = 0, max = 100, decimal = 0) {
	if (min >= 0) {
		return round(Math.random() * max, decimal);
	}
	const offset = max - min;
	return round(Math.random() * offset - max, decimal);
}

function urlContains(str) {
	return window.location.href.indexOf(str) > -1;
}
