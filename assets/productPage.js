// Hide missing product videos for QM4Cg7 or FxQj6U
if (typeof productVideo !== "undefined" && productVideo === "") {
  let productVideoElementQM4Cg7 = document.querySelector('[id*="QM4Cg7"]');
  let productVideoElementFxQj6U = document.querySelector('[id*="FxQj6U"]');
  
  if (productVideoElementQM4Cg7) {
    productVideoElementQM4Cg7.style.display = "none";
  }
  
  if (productVideoElementFxQj6U) {
    productVideoElementFxQj6U.style.display = "none";
  }
}

// Hide missing product videos for QM4Cg7 or FxQj6U
if (typeof productVideo !== "undefined" && productVideo === "") {
  var elementQM4Cg7 = document.querySelector('[id*="QM4Cg7"]');
  var elementFxQj6U = document.querySelector('[id*="FxQj6U"]');
  
  if (elementQM4Cg7) {
    elementQM4Cg7.style.display = "none";
  }
  
  if (elementFxQj6U) {
    elementFxQj6U.style.display = "none";
  }
}
