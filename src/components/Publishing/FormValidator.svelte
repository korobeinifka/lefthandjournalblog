<script lang="ts">
  import { onMount } from "svelte";

  const invalidClasses = ["border-red-400", "focus:border-red-500", "focus:ring-red-500"];
  const helperClass = "mt-2 text-sm text-red-500";
  const fieldAttribute = "data-required-field";
  const formSelector = "[data-publishing-form]";

  const isFormControl = (
    element: EventTarget | null,
  ): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => {
    return (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    );
  };

  const ensureHelper = (field: HTMLElement) => {
    const baseId =
      field.dataset.helperId ?? field.id ?? field.getAttribute("name") ?? `helper-${Date.now()}`;
    const helperId = baseId.endsWith("-helper") ? baseId : `${baseId}-helper`;
    field.dataset.helperId = helperId;
    let helper = document.getElementById(helperId);

    if (!helper) {
      helper = document.createElement("p");
      helper.id = helperId;
      helper.dataset.helperFor = field.getAttribute("name") ?? helper.id;
      helper.className = helperClass;
      helper.hidden = true;
      helper.setAttribute("aria-live", "polite");
      helper.setAttribute("role", "status");
      field.insertAdjacentElement("afterend", helper);
    }

    if (helper.id && !field.getAttribute("aria-describedby")) {
      field.setAttribute("aria-describedby", helper.id);
    }

    return helper;
  };

  const setFieldValidity = (field: HTMLElement, invalid: boolean, message: string) => {
    const helper = ensureHelper(field);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");

    if (invalid) {
      helper.textContent = message;
      helper.hidden = false;
      invalidClasses.forEach((name) => field.classList.add(name));
    } else {
      helper.textContent = "";
      helper.hidden = true;
      invalidClasses.forEach((name) => field.classList.remove(name));
    }
  };

  const validateField = (field: HTMLElement) => {
    if (!isFormControl(field)) {
      return true;
    }

    const customMessage = field.dataset.validationMessage || "This field is required.";
    const isValid = field.checkValidity();

    if (!isValid) {
      setFieldValidity(field, true, customMessage);
    } else {
      setFieldValidity(field, false, "");
    }

    return isValid;
  };

  const handleInput = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.hasAttribute(fieldAttribute)) return;
    validateField(target);
  };

  onMount(() => {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!form) return;

    const requiredFields = Array.from(form.querySelectorAll<HTMLElement>(`[${fieldAttribute}]`));
    requiredFields.forEach((field) => {
      ensureHelper(field);
      field.setAttribute("aria-invalid", "false");
    });

    const submitHandler = (event: Event) => {
      let hasErrors = false;

      requiredFields.forEach((field) => {
        const fieldIsValid = validateField(field);
        if (!fieldIsValid) {
          hasErrors = true;
        }
      });

      if (hasErrors) {
        event.preventDefault();
        const firstInvalid = requiredFields.find((field) => field.getAttribute("aria-invalid") === "true");
        if (firstInvalid instanceof HTMLElement) {
          firstInvalid.focus?.();
        }
      }
    };

    form.addEventListener("submit", submitHandler);
    form.addEventListener("input", handleInput, true);
    form.addEventListener("change", handleInput, true);

    return () => {
      form.removeEventListener("submit", submitHandler);
      form.removeEventListener("input", handleInput, true);
      form.removeEventListener("change", handleInput, true);
    };
  });
</script>

<slot />
