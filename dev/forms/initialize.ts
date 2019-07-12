export function initialize() {
    const form = FormApp.getActiveForm();

    // Setup onFormSubmit
    ScriptApp.newTrigger('onFormSubmit')
        .forForm(form)
        .onFormSubmit()
        .create();

    form.addCheckboxItem()
        .setTitle('')
        .setChoiceValues([])
        .setRequired(false)
        .setValidation(
            FormApp.createCheckboxValidation()
                .requireSelectExactly(2)
                .build()
        );
}
