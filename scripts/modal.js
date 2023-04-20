export function modalInnerHTML({
	title = "Thank you!",
	content = "Your message has been received!",
	id = "modalPopup",
} = {}) {
	const modalInnerHTML = `
  <div id="${id}" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body">
        <p>${content}</p>
      </div>
      <div class="modal-footer">
        <button id="modal-back-button" type="button">&larr; Back to my site</button>
      </div>
    </div>
  </div>
  `;

	const modalCSS = `<link rel="stylesheet" href="./styles/modal.css" />`;

	function inject() {
		document.body.innerHTML += modalInnerHTML;
		document.body.innerHTML += modalCSS;
	}

	function removeModal(modal) {
		// document.head.innerHTML = document.head.innerHTML.replace(modalCSS, "");
		// modal.remove();
		window.location.reload();
	}

	const states = initModalEvent(id, inject, removeModal);

	// register modal events
	return states;
}

function initModalEvent(id = "", inject = () => {}, removeModal = () => {}) {
	function showModal() {
		// inject first
		inject();

		// then get element reference
		const modal = document.getElementById(id);

		// close modal when clicking outside
		window.onclick = function (event) {
			if (event.target == modal) {
				closeModal();
			}
		};

		const backButton = document.getElementById("modal-back-button");
		backButton.onclick = () => {
			closeModal();
		};

		modal.classList.add("modal-shown");
		modal.classList.remove("modal-closed");
	}

	function closeModal() {
		const modal = document.getElementById(id);

		modal.classList.remove("modal-shown");
		modal.classList.add("modal-closed");
		removeModal(modal);
	}

	return { showModal, closeModal, inject, removeModal };
}
