/** "PartTime" -> "Part Time". */
export const spaceWords = (label: string) =>
  label.replace(/([a-z])([A-Z])/g, "$1 $2");
