const characters = "0123456789";

export function generateVotersNumber() {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  let votingNumber = `AUS-0000${result}-${new Date()
    .getFullYear()
    .toString()
    .substr(-2)}`;
  return votingNumber;
}

export const disableSubmitButton = (formValueKeys, formValues) => {
  return !!formValueKeys.filter((item) => !formValues[item]).length;
};
