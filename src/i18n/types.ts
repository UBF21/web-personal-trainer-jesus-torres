export interface Translations {
  nav: {
    about: string
    services: string
    credentials: string
    plans: string
    recipes: string
    contact: string
  }
  hero: {
    titleLine1: string
    titleLine2: string
    description: string
    ctaPrimary: string
    ctaSecondary: string
  }
  about: {
    badge: string
    titleLine1: string
    titleLine2: string
    paragraph1: string
    paragraph2: string
    paragraph3: string
    paragraph4: string
    statsYears: string
    statsYearsLabel: string
    statsClients: string
    statsClientsLabel: string
    statsSuccess: string
    statsSuccessLabel: string
  }
  services: {
    badge: string
    titleLine1: string
    titleLine2: string
    description: string
    items: Array<{
      title: string
      description: string
    }>
  }
  credentials: {
    badge: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    certifications: string[]
  }
  brands: {
    badge: string
    titleLine1: string
    titleLine2: string
    description: string
    statsPartners: string
    statsCommitment: string
    statsYears: string
  }
  doctor: {
    badge: string
    titleLine1: string
    titleLine2: string
    specialty: string
    bio: string
    award1: string
    award2: string
    speakingBio: string
    speakingLink: string
    speakingBioEnd: string
  }
  plans: {
    badge: string
    titleLine1: string
    titleLine2: string
    description: string
    viewCards: string
    viewTable: string
    popular: string
    select: string
    selectTable: string
    guarantee: string
    guaranteeQuestion: string
    feature: string
    items: Array<{
      name: string
      duration: string
      description: string
      features: string[]
    }>
    tableRows: Array<{
      label: string
      values: (boolean | string)[]
    }>
  }
  contact: {
    badge: string
    titleLine1: string
    titleLine2: string
    description: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    submitButton: string
    submitting: string
    submitted: string
  }
  partners: {
    badge: string
    titleLine1: string
    titleLine2: string
    description: string
    codeCopied: string
    activateDiscount: string
    visitWeb: string
    bottomNote: string
  }
  home: {
    recipesBadge: string
    recipesTitleLine1: string
    recipesTitleLine2: string
    recipesDescription: string
    exploreRecipes: string
    buyRecipeBook: string
    recipesCount: string
    recipesCountLabel: string
    healthyPercent: string
    healthyLabel: string
    viewRecipe: string
    footerDescription: string
    quickLinks: string
    aboutLink: string
    servicesLink: string
    contactLink: string
    followUs: string
    copyright: string
  }
  recetas: {
    pageTitle: string
    pageSubtitle: string
    mealTypeLabel: string
    macroLabel: string
    clearFilters: string
    noResults: string
    buyComplete: string
    protein: string
    carbs: string
    fats: string
    mealTypes: string[]
    macroFilters: string[]
    recipes: Array<{
      title: string
      type: string
      tags: string[]
    }>
  }
  recipeDetail: {
    backToRecipes: string
    time: string
    difficulty: string
    servings: string
    protein: string
    carbs: string
    fats: string
    calories: string
    ingredients: string
    instructions: string
    supplements: string
    recommendations: string
    characteristics: string
    relatedRecipes: string
    notFound: string
    backLink: string
    recipes: Array<{
      title: string
      type: string
      tags: string[]
      servings: string
      prepTime: string
      difficulty: string
      ingredients: Array<{ name: string; amount: string }>
      instructions: string[]
      supplements: Array<{ name: string; benefit: string }>
      recommendations: string[]
    }>
  }
  maintenance: {
    title: string
    subtitle: string
    description: string
    estimatedTime: string
    questionPrompt: string
    sendEmail: string
    copyright: string
  }
}
