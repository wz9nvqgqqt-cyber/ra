const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

const form = document.getElementById("estimatorForm");

const output = {
  floorArea: document.getElementById("floorArea"),
  roofArea: document.getElementById("roofArea"),
  steelWeight: document.getElementById("steelWeight"),
  baySpacing: document.getElementById("baySpacing"),
  budgetRange: document.getElementById("budgetRange"),
  budgetNote: document.getElementById("budgetNote"),
  assumptions: document.getElementById("assumptions"),
  timeline: document.getElementById("timeline"),
  scopeList: document.getElementById("scopeList"),
};

const useCaseMap = {
  warehouse: { label: "Warehouse", baseCost: 38, steelFactor: 6.5 },
  manufacturing: { label: "Manufacturing", baseCost: 46, steelFactor: 7.5 },
  retail: { label: "Retail", baseCost: 52, steelFactor: 6.8 },
  agriculture: { label: "Agriculture", baseCost: 34, steelFactor: 6.0 },
};

const roofMap = {
  galvalume: { label: "Galvalume panels", multiplier: 1.0 },
  standing: { label: "Standing seam", multiplier: 1.15 },
  insulated: { label: "Insulated panels", multiplier: 1.28 },
};

const insulationMap = {
  none: { label: "No wall insulation", multiplier: 1.0 },
  basic: { label: "R-13 fiberglass", multiplier: 1.06 },
  high: { label: "High-performance insulation", multiplier: 1.14 },
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatNumber = (value, unit = "") => {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

const buildTimeline = (baseWeeks) => [
  { phase: "Design & permitting", weeks: Math.round(baseWeeks * 0.28) },
  { phase: "Fabrication", weeks: Math.round(baseWeeks * 0.32) },
  { phase: "Foundations", weeks: Math.round(baseWeeks * 0.18) },
  { phase: "Erection & envelope", weeks: Math.round(baseWeeks * 0.22) },
];

const buildScopeList = (options) => {
  const scope = [
    "Structural steel frames + secondary members",
    "Roof system + gutters/downspouts",
    "Exterior wall panels + trim package",
    "Steel erection + equipment",
    "Engineering + stamped calculations",
    "Anchor bolts + base plates",
    "Foundation and sitework (allowance)",
    "MEP and interior build-out (allowance)",
  ];

  if (options.crane) {
    scope.unshift("Crane runway beams + column stiffeners");
  }

  if (options.fire) {
    scope.push("Fire-rated wall assemblies");
  }

  if (options.insulation !== "none") {
    scope.push("Wall insulation + vapor barrier");
  }

  if (options.roof === "insulated") {
    scope.push("Insulated roof panel system");
  }

  return scope;
};

const buildAssumptions = (options) => {
  const tags = [
    `Use: ${useCaseMap[options.useCase].label}`,
    `Roof: ${roofMap[options.roof].label}`,
    `Insulation: ${insulationMap[options.insulation].label}`,
  ];

  if (options.crane) {
    tags.push("Bridge crane allowance");
  }

  if (options.fire) {
    tags.push("Fire-rated envelope");
  }

  return tags;
};

const updateUI = (data) => {
  output.floorArea.textContent = formatNumber(data.floorArea, "sq ft");
  output.roofArea.textContent = formatNumber(data.roofArea, "sq ft");
  output.steelWeight.textContent = formatNumber(data.steelWeight, "lbs");
  output.baySpacing.textContent = formatNumber(data.baySpacing, "ft");

  output.budgetRange.textContent = `${currencyFormatter.format(data.budgetMin)} - ${
    currencyFormatter.format(data.budgetMax)
  }`;

  output.budgetNote.textContent = `Based on a ${
    currencyFormatter.format(data.costPerSqFt)
  }/sq ft average with ${data.riskBand}% contingency.`;

  output.assumptions.innerHTML = "";
  buildAssumptions(data.options).forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    output.assumptions.appendChild(span);
  });

  output.timeline.innerHTML = "";
  buildTimeline(data.timelineWeeks).forEach((item) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = item.phase;
    const value = document.createElement("strong");
    value.textContent = `${item.weeks} wks`;
    li.appendChild(label);
    li.appendChild(value);
    output.timeline.appendChild(li);
  });

  output.scopeList.innerHTML = "";
  buildScopeList(data.options).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    output.scopeList.appendChild(li);
  });
};

const calculateEstimate = (formValues) => {
  const { length, width, height, pitch, bays, useCase, roof, insulation, crane, fire } = formValues;
  const floorArea = length * width;
  const pitchRadians = (pitch * Math.PI) / 180;
  const roofArea = Math.round(floorArea / Math.cos(pitchRadians));

  const base = useCaseMap[useCase];
  const roofOption = roofMap[roof];
  const insulationOption = insulationMap[insulation];

  const heightFactor = height > 26 ? 1.08 : 1.0;
  const craneFactor = crane ? 1.12 : 1.0;
  const fireFactor = fire ? 1.1 : 1.0;

  const costPerSqFt =
    base.baseCost * roofOption.multiplier * insulationOption.multiplier * heightFactor * craneFactor * fireFactor;

  const riskBand = 10;
  const budgetMin = floorArea * costPerSqFt * (1 - riskBand / 100);
  const budgetMax = floorArea * costPerSqFt * (1 + riskBand / 100);

  const steelWeight = Math.round(floorArea * base.steelFactor);
  const baySpacing = Math.round(length / bays);

  const timelineWeeks = Math.max(14, Math.round(8 + floorArea / 2500));

  return {
    floorArea,
    roofArea,
    steelWeight,
    baySpacing,
    budgetMin,
    budgetMax,
    costPerSqFt,
    riskBand,
    timelineWeeks,
    options: { useCase, roof, insulation, crane, fire },
  };
};

const getFormValues = () => ({
  length: Number.parseFloat(document.getElementById("length").value),
  width: Number.parseFloat(document.getElementById("width").value),
  height: Number.parseFloat(document.getElementById("height").value),
  pitch: Number.parseFloat(document.getElementById("pitch").value),
  bays: Number.parseFloat(document.getElementById("bays").value),
  useCase: document.getElementById("useCase").value,
  roof: document.getElementById("roof").value,
  insulation: document.getElementById("insulation").value,
  crane: document.getElementById("crane").checked,
  fire: document.getElementById("fire").checked,
});

const handleSubmit = (event) => {
  event.preventDefault();
  const values = getFormValues();
  const result = calculateEstimate(values);
  updateUI(result);
};

if (form) {
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("change", () => {
    const values = getFormValues();
    const result = calculateEstimate(values);
    updateUI(result);
  });
}

const initialValues = form ? getFormValues() : null;
if (initialValues) {
  updateUI(calculateEstimate(initialValues));
}
