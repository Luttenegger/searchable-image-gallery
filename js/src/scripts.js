function ready(a) {
	"loading" != document.readyState ? a() : document.addEventListener("DOMContentLoaded", a);
}

ready(function () {
	// *************** uncomment ajax if you want to us CSV file instead of the array ***************
	// ajax_getImageData();
	createGallery(imagesArray);
	addDropdownFilters(imagesArray);
	addSearchListener();
	setResetButton();
	addModalListeners();
	showLoader(false);
});

const searchGallery = document.getElementById('searchGallery');
const searchInput = document.getElementById('searchInput');
const searchGalModal = document.getElementById("searchGalModal");
// *************** Change to where your images are located ***************
const imagePath = 'https://via.placeholder.com/';
let delay = 0;
// *************** uncomment if using CSV file ***************
// let imagesArray

//-------------------- Gallery Creation ----------------------//
function createGallery(imagesArray) {
	searchGallery.innerHTML = '';
	imagesArray.forEach(function (e) {
		searchGallery.insertAdjacentHTML('beforeend', createImageElement(e));
	});
	showLoader(false);
	delay = 0;
}

const createImageElement = (item) => {
	// Item indexes are based on their column location in the CSV file
	const html = generateImageHTML(item[0], item[1], item[2], item[3], item[4].split(","));
	delay += 100;
	return html;
}

function generateImageHTML(type, subType, title, description, images) {
	return `
		<div onclick="generateModal('${title}', '${description}', '${images}')" class="search-gallery__gallery__element" style="animation-delay: ${delay}ms">
			${generateGalleryIcon(images)}
			<div class="search-gallery__gallery__element__image"><img src="${imagePath}/${images[0]}" /></div>
			<div class="search-gallery__gallery__element__title"><h3>${title}</h3></div>
			<div class="search-gallery__gallery__element__description">${description}</div>
			<div class="search-gallery__gallery__element__description__types">
				${returnType(type, 'primary')}
				${returnType(subType, 'secondary')}
			</div>
		</div>
	`;
}

const returnType = (type, className) => {
	console.log(type);
	if (type !== "") {
		return `<div class="search-gallery__gallery__element__description__types__type ${className}"><span>${type}</span></div>`;
	}
	else {
		return '';
	}
}

const generateGalleryIcon = (images) => {
	let html = '';
	if (images.length > 1) {
		html = `
			<i class="search-gallery__gallery__element__icon fa fa-image">Gallery</i>
		`;
	}
	return html;
}

//-------------------- Dropdowns ----------------------//
function addDropdownFilters(imagesArray) {
	createDropdown("Type", 0, imagesArray);
	createDropdown("Sub-Type", 1, imagesArray);
	addDropdownEvents();
}

function createDropdown(title, index, imagesArray) {
	let currentList = [];
	imagesArray.forEach(image => {
		if (image[index] !== "") {
			currentList.push(image[index]);
		}
	});
	currentList.sort();
	let newList = new Set(currentList);
	createDropdownList(newList, title, index)
}

function createDropdownList(newList, title) {
	const filterContainer = document.querySelector(".search-gallery__search__dropdowns");
	let html = `<select class="search-gallery__search__dropdowns__filter" name="${title}"><option value="${title}">${title}</option>`;
	newList.forEach(item => {
			html += `<option value="${item}">${item}</option>`;
	});
	html += `</select>`;
	filterContainer.insertAdjacentHTML('beforeend', html);
}

function addDropdownEvents() {
	const dropdowns = Array.prototype.slice.call(document.querySelectorAll('.search-gallery__search__dropdowns__filter'));
	dropdowns.forEach((dropdown) => {
		dropdown.addEventListener("change", function () {
			showLoader(true);
			checkDropdownValues(dropdowns);
		});
	})
}

function checkDropdownValues (dropdowns) {
	let valueArray = [];
	dropdowns.forEach(dropdown => {
		if (dropdown.selectedIndex !== 0) {
			valueArray.push(dropdown.value.toLowerCase());
		}
	});
	searchImageArray(valueArray, true);
}

const checkItemForAllDropdownValues = (item, searchTermArray) => {
	let numToBeFound = searchTermArray.length;
	let numFound = 0;
	searchTermArray.forEach(dropValue => {
		for (let i = 0; i < item.length; i++) {
			if (item[i].toLowerCase() == dropValue) {
				numFound++;
				break;
			}
		}
	})
	if (numToBeFound === numFound) { return true; } else { return false; }
}

//-------------------- Search ----------------------//
function addSearchListener() {
	searchInput.addEventListener('keyup', getUserInput);
}

function getUserInput() {
	showLoader(true);
	const userInput = searchInput.value;
	searchImageArray([userInput.toLowerCase()]);
}

function searchImageArray(searchTermArray, searchDropdowns = false) {
	searchGallery.innerHTML = '';
	let results = false;
	imagesArray.forEach(item => {
		const somethingFound = findMatch(item, searchTermArray, searchDropdowns);
		if(somethingFound) {
			results = true;
			searchGallery.insertAdjacentHTML('beforeend', createImageElement(item));
		}
	});
	if (!results) { showNoResults(); }
	delay = 0;
	showLoader(false);
}

function showNoResults() {
	searchGallery.innerHTML =  `<div style="width:100%; margin-left:auto; margin-right:auto; justify-content:center !important; text-align:center; font-size:24px; margin-bottom:-28px;"><h3>No Results Found!</h3></div><img style="width:300px; justify-content:center !important;" src="https://image.shutterstock.com/image-vector/no-image-available-vector-illustration-600w-744886198.jpg" alt="Avatar" class="career-path__courses__course-item__image image" style="width:100%">`;
}

const findMatch = (item, searchTermArray, searchDropdowns) => {
	let matchFound = false;
	for (let i = 0; i < item.length; i++) {
		if (searchDropdowns) {
			matchFound = checkItemForAllDropdownValues(item, searchTermArray);
		}
		else if (item[i].toLowerCase().indexOf(searchTermArray[0]) !== -1 && !searchDropdowns) {
			matchFound = true;
			break;
		}
	}
	return matchFound;
}

//-------------------- Modal ----------------------//
function generateModal(title, description, images) {
	showModal();
	searchGalModal.innerHTML = generateModalHTML(title, description, images.split(","));
	addSlideshowControls(images.split(","));
}

const generateModalHTML = (title, description, images) => {
	return `
		<div class="search-gallery__modal__close" onClick="closeModal()">
			<div class="search-gallery__modal__close__close-button">Close</div>
		</div>
		<span class="search-gallery__modal__title">${title}</span>
		${generateSlideshowSlides(images)}
		<div class="search-gallery__modal__description">${description}</div>
	`;
}

function addModalListeners() {
	document.addEventListener('mouseup', function(e) {
		if (!searchGalModal.contains(e.target)) {
			closeModal();
		}
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeModal();
		}
	  })
}


function closeModal() {
	searchGalModal.classList.remove("showModal");
	searchGalModal.classList.add("hidden");
}

function showModal() {
	searchGalModal.innerHTML = '';
	searchGalModal.classList.remove("hidden");
	searchGalModal.classList.add("showModal");
}

//-------------------- Slideshow -----------------------//

const generateSlideshowSlides = (images) => {
	let slideshowHTML = `<div class="search-gallery__modal__slideshow">${generateSlideshowControls(images)}`;
	images.forEach((image, i) => {
		slideshowHTML += generateSlide(image, i);
	});
	slideshowHTML += '</div>';
	return slideshowHTML;
}

function addSlideshowControls(images) {
	if (images.length > 1) {
		const slideShowArrows = Array.prototype.slice.call(document.querySelectorAll('.search-gallery__modal__slideshow__arrows__arrow'));
		slideShowArrows.forEach((arrow, i) => {
			arrow.addEventListener('click', function () {
				prevOrNextImage(i);
			});
		})
	}
}

function prevOrNextImage(i) {
	const slides = Array.prototype.slice.call(document.querySelectorAll('.search-gallery__modal__slideshow__slide'));
	if (i === 0) {
		findPrevOrNextSlide(slides, 'previous');
	}
	else {
		findPrevOrNextSlide(slides, 'next');
	}
}

function findPrevOrNextSlide(slides, prevOrNext) {
	for (let i = 0; i < slides.length; i++) {
		let slide = slides[i];
		if (slide.classList.contains('show')) {
			const currentSlideIndex = parseInt(slide.getAttribute("data-slide"));
			slide.classList.remove('show');
			slide.classList.add('hidden');
			if (prevOrNext === 'previous') { previousSlide(currentSlideIndex, slides.length, prevOrNext); }
			if (prevOrNext === 'next') { nextSlide(currentSlideIndex, slides.length, prevOrNext); }
			break;
		} 
	}
}

function previousSlide(currentSlideIndex, numOfSlides) {
		let index = currentSlideIndex - 1;
		if (index === -1) { index = numOfSlides - 1; }
		showSlide(document.querySelector(`[data-slide="${index}"]`), index, numOfSlides)
}

function nextSlide(currentSlideIndex, numOfSlides) {
		let index = currentSlideIndex + 1;
		if (index === numOfSlides) { index = 0; }
		showSlide(document.querySelector(`[data-slide="${index}"]`), index, numOfSlides)
}

function showSlide(slide, index, numOfSlides) {
	slide.classList.remove('hidden');
	slide.classList.add('show');
	// console.log(index, numOfSlides);
	document.getElementById('galleryCount').innerHTML = `${index + 1}/${numOfSlides}`;
}


const generateSlide = (image, i) => {
	return `
		<div class="search-gallery__modal__slideshow__slide ${showFirstSlide(i)}" data-slide="${i}">
			<img src="${imagePath}/${image}" />
		</div>
	`;
}

const generateSlideshowControls = (images) => {
	let controlsHTML = '';
	if (images.length > 1) {
		controlsHTML = `
			<div class="search-gallery__modal__slideshow__count" id="galleryCount">1/${images.length}</div>
			<div class="search-gallery__modal__slideshow__arrows">
				<div class="search-gallery__modal__slideshow__arrows__arrow">&#10094;</div>
				<div class="search-gallery__modal__slideshow__arrows__arrow">&#10095;</div>
			</div>
		`;
	}
	return controlsHTML;
}

const showFirstSlide = (i) => {
	if (i === 0) {
		return 'show';
	}
	else {
		return 'hidden';
	}
}

//-------------------- Reset ----------------------//
function setResetButton() {
	const resetButton = document.getElementById('reset');
	resetButton.addEventListener('click', resetValues);
}

function resetValues() {
	Array.prototype.slice.call(document.querySelectorAll('.search-gallery__search__dropdowns__filter')).forEach(dropdown => {
		dropdown.selectedIndex = 0;
	})
	document.getElementById("searchInput").value = '';
	createGallery(imagesArray);
}

//-------------------- Ajax ----------------------//
function ajax_getImageData() {
	var request = new XMLHttpRequest();
	request.open("POST", "../../php/functions.php", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	request.send("");
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			//Success! Now iterate through data
			var data = request.responseText;
			const promoArray = JSON.parse(data);
			imagesArray = promoArray; //For Searching
			createGallery(imagesArray);
			addDropdownFilters(imagesArray);
		} else {
			// We reached our target server, but it returned an error
		}
	};
	request.onerror = function () {
		// There was a connection error of some sort
	};
}

function help_transformURL() {
	var scriptLocation = new Object();
	scriptLocation.location = "./php/functions.php";
	var scriptURL = scriptLocation.location;
	return scriptURL;
}

//-------------------- Helpers ----------------------//
//For when you need to show/hide the loader on the page
function showLoader(trueOrFalse) {
	if (trueOrFalse == true) {
		searchGallery.style.display = "none";
		document.getElementById("loader").style.display = "flex";
	} else {
		searchGallery.style.display = "flex";
		document.getElementById("loader").style.display = "none";
	}
}

if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		var el = this;

		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}
