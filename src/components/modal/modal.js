import { escapeHtml } from "../../utils/helpers.js";

export function closeModal() {
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");
  if (!modal || !modalForm) return;
  modal.classList.add("hide");
  modalForm.innerHTML = "";
}

export function openModal(title, fields, submitHandler) {
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");
  const modalTitle = document.getElementById("modal-title");
  const modalSave = document.getElementById("modal-save");
  if (!modal || !modalForm || !modalTitle) return;

  modalTitle.textContent = title;
  modalForm.innerHTML = fields.map(renderField).join("");
  modal.classList.remove("hide");

  modalForm.onsubmit = async (event) => {
    event.preventDefault();
    if (!modalForm.reportValidity()) return;

    const formData = new FormData(modalForm);
    const result = {};
    for (const [key, value] of formData.entries()) {
      result[key] = typeof value === "string" ? value.trim() : value;
    }
    await submitHandler(result);
  };

  if (modalSave) modalSave.onclick = () => modalForm.requestSubmit();
}

function renderField(field) {
  const required = field.required ? "required" : "";
  const value = escapeHtml(field.value || "");

  if (field.type === "textarea") {
    return `<textarea name="${field.name}" placeholder="${escapeHtml(field.label)}" ${required}>${value}</textarea>`;
  }

  if (field.type === "select") {
    return `
      <select name="${field.name}" ${required}>
        ${field.options
          .map(
            (option) =>
              `<option value="${escapeHtml(option.value)}" ${
                option.value === field.value ? "selected" : ""
              }>${escapeHtml(option.label)}</option>`,
          )
          .join("")}
      </select>
    `;
  }

  return `<input name="${field.name}" type="${field.type}" placeholder="${escapeHtml(field.label)}" value="${value}" ${required} />`;
}

