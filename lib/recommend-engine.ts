import type {
  Recommendation,
  RequirementAnalysis,
  RequirementGapAnalysis,
RequirementGapItem,
RequirementGapStatus,
  Standard,
} from '@/lib/types'
import standardsData from '@/standards.json'
import foodStandardsData from '@/food-standards.json'

type ExcelStandard = {
  id: string
  code: string
  part: string | null
  year: number | null
  title: string
  category: string
  status: string
  domain: string
}
type FoodStandard = {
  Code: string
  Title: string
  Scope: string
  Material: string
  Grade: string
  Dimensions: string
  Performance: string
  'Mechanical Properties': string
  Testing: string
  Sampling: string
  'Acceptance Criteria': string
  Marking: string
  Application: string
  'Evidence / Section': string
}

/**
 * Converts one dataset record into the shape expected by the existing UI.
 *
 * IMPORTANT:
 * The current dataset contains metadata only:
 * Code, Part, Year, Title, Category, Status and Domain.
 *
 * Therefore this function never invents technical specifications.
 */
function toStandard(item: ExcelStandard): Standard {
  const status = item.status.toLowerCase()

  return {
    id: item.id,
    code: item.code,
    title: item.title,
    category: item.category,
    type: 'Specification',
    status:
      status === 'current'
        ? 'active'
        : status === 'draft'
          ? 'draft'
          : status === 'under-review'
            ? 'under-review'
            : 'superseded',
    version: item.part ? `Part ${item.part}` : 'Current',
    date: item.year ? String(item.year) : 'Not specified',
    scope: item.title,
    applicableAreas: [item.domain],
    material: item.category,
    application: item.domain,
    relevanceScore: 0,
    whyRecommended: '',
    sections: [],
    technicalRequirements: {
      material: 'Not available in the current dataset.',
      dimensions: 'Not available in the current dataset.',
      performance: 'Not available in the current dataset.',
      testing: 'Not available in the current dataset.',
      marking: 'Not available in the current dataset.',
    },
    testingRequirements: [],
    markingRequirements: [],
    relatedStandardIds: [],
    evidenceTrace: {
      requirementSignal: '',
      matchedConcepts: [],
      standardScope: item.title,
      supportingSections: [],
      extractedRequirements: [],
    },
  }
}
function toFoodStandard(item: FoodStandard): Standard {
  return {
    id: item.Code.toLowerCase().replace(/\s+/g, '-').replace(/:/g, ''),
    code: item.Code,
    title: item.Title,
    category: item.Application || 'Food',
    type: 'Specification',
    status: 'active',
    version: 'Current',
    date: 'Not specified',

    scope: item.Scope || item.Title,

    applicableAreas: [
      item.Application || 'Food',
    ],

    material: item.Material || 'Not specified',

    application:
      item.Application || 'Food',

    relevanceScore: 0,
    whyRecommended: '',

    sections: [],

    technicalRequirements: {
      material:
        item.Material || 'Available in detailed food dataset.',

      dimensions:
        item.Dimensions || 'Not specified.',

      performance:
        [
          item.Performance,
          item['Mechanical Properties'],
        ]
          .filter(Boolean)
          .join(' ') ||
        'Not specified.',

      testing:
        item.Testing || 'Not specified.',

      marking:
        item.Marking || 'Not specified.',
    },

    testingRequirements: item.Testing
      ? [item.Testing]
      : [],

    markingRequirements: item.Marking
      ? [item.Marking]
      : [],

    relatedStandardIds: [],

    evidenceTrace: {
      requirementSignal: '',
      matchedConcepts: [],
      standardScope:
        item.Scope || item.Title,
      supportingSections:
        item['Evidence / Section']
          ? [item['Evidence / Section']]
          : [],
      extractedRequirements: [],
    },
  }
}

/**
 * Load the complete dataset.
 *
 * The dataset itself is never modified by the recommendation engine.
 */
const GENERAL_STANDARDS: Standard[] = (
  standardsData as ExcelStandard[]
).map(toStandard)

const FOOD_STANDARDS: Standard[] = (
  foodStandardsData as FoodStandard[]
).map(toFoodStandard)

const STANDARDS: Standard[] = [
  ...GENERAL_STANDARDS,
  ...FOOD_STANDARDS,
]

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'for',
  'and',
  'or',
  'of',
  'to',
  'in',
  'on',
  'with',
  'we',
  'need',
  'needs',
  'require',
  'required',
  'requirement',
  'requirements',
  'our',
  'is',
  'are',
  'be',
  'that',
  'this',
  'these',
  'those',
  'suitable',
  'used',
  'use',
  'using',
  'high',
  'low',
  'minimum',
  'maximum',
  'project',
  'application',
  'applications',
  'please',
  'provide',
  'providing',
  'must',
  'should',
])

const MATERIAL_TERMS = [
  'steel',
  'stainless steel',
  'carbon steel',
  'alloy steel',
  'concrete',
  'cement',
  'aluminium',
  'aluminum',
  'copper',
  'brass',
  'iron',
  'cast iron',
  'plastic',
  'pvc',
  'upvc',
  'polyethylene',
  'polypropylene',
  'rubber',
  'glass',
  'wood',
  'timber',
  'ceramic',
  'brick',
  'mortar',
]

const APPLICATION_TERMS = [
  'human consumption',
'food consumption',
'drinking',

  'construction',
  'building',
  'reinforced concrete',
  'water supply',
  
  'drinking water',
  'human consumption',
  'for human consumption',
  
  'packaged drinking water',
  'food consumption',
  'food processing',
  'food hygiene',
  'drainage',
  'irrigation',
  'road',
  'bridge',
  'railway',
  'electrical',
  'plumbing',
  'structural',
  'industrial',
  'agricultural',
  'sewage',
  'pipeline',
]

const TESTING_TERMS = [
  'test',
  'testing',
  'tested',
  'test method',
  'inspection',
  'sampling',
  'sample',
]

const MARKING_TERMS = [
  'marking',
  'marked',
  'label',
  'labelling',
  'labeling',
]

const PERFORMANCE_TERMS = [
  'performance',
  'strength',
  'elongation',
  'durability',
  'resistant',
  'resistance',
  'load',
  'pressure',
  'temperature',
  'impact',
  'hardness',
  'tensile',
  'yield',
  'flexural',
  'compressive',
]

const DIMENSION_TERMS = [
  'dimension',
  'dimensions',
  'diameter',
  'length',
  'width',
  'thickness',
  'height',
  'size',
  'nominal',
  'mm',
  'cm',
  'metre',
  'meter',
]

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string): string[] {
  return Array.from(
    new Set(
      normalize(value)
        .replace(/-/g, ' ')
        .split(/\s+/)
        .filter(
          (token) =>
            token.length > 2 && !STOP_WORDS.has(token),
        ),
    ),
  )
}

function containsAny(
  text: string,
  terms: string[],
): string[] {
  const normalizedText = normalize(text)

  return terms.filter((term) =>
    normalizedText.includes(normalize(term)),
  )
}

function firstMatchingPhrase(
  requirement: string,
  terms: string[],
): string {
  const normalizedRequirement = normalize(requirement)

  const match = terms.find((term) =>
    normalizedRequirement.includes(normalize(term)),
  )

  return match ?? ''
}

/**
 * Extracts structured information only from words actually present
 * in the user's requirement.
 *
 * No technical values are generated here.
 */
function extractRequirement(
  requirement: string,
): RequirementAnalysis {
  const normalizedRequirement = normalize(requirement)

  const productTerms = [
    'packaged water',
'packaged drinking water',
'drinking water',
'bottled water',
'potable water',
'water for human consumption',
    'reinforcement bars',
'reinforcing bars',
'deformed steel bars',
'steel reinforcement bars',
'reinforcement steel',
'steel bars',
'concrete reinforcement',
'reinforcing steel',
    'pipes',
    'pipe',
    'cement',
    'concrete',
    'bricks',
    'brick',
    'bolts',
    'nuts',
    'wires',
    'wire',
    'cables',
    'cable',
    'valves',
    'valve',
    'doors',
    'windows',
    'tiles',
    'transformer',
    'switchgear',
  ]

const product =
  firstMatchingPhrase(normalizedRequirement, productTerms)

  const material =
    firstMatchingPhrase(normalizedRequirement, MATERIAL_TERMS)

  const application =
    firstMatchingPhrase(
      normalizedRequirement,
      APPLICATION_TERMS,
    )

  /**
   * Grade examples such as Fe 500D, Fe500, M25, IS 456 etc.
   *
   * The value is copied from the user's text only.
   */
  const gradeMatch = requirement.match(
    /\b(?:fe\s*[-]?\s*\d+[a-z]?|m\s*[-]?\s*\d+|grade\s+[a-z0-9-]+)\b/gi,
  )

  const grade = gradeMatch
    ? Array.from(new Set(gradeMatch.map((value) => value.trim()))).join(
        ', ',
      )
    : ''

  const dimensionMatches = requirement.match(
    /\b\d+(?:\.\d+)?\s*(?:mm|cm|m|metre|meter|inch|inches)\b/gi,
  )

  const dimensions = dimensionMatches
    ? Array.from(
        new Set(dimensionMatches.map((value) => value.trim())),
      ).join(', ')
    : containsAny(
          normalizedRequirement,
          DIMENSION_TERMS,
        ).length > 0
      ? containsAny(
          normalizedRequirement,
          DIMENSION_TERMS,
        ).join(', ')
      : ''

  const performanceMatches = [
    ...containsAny(normalizedRequirement, PERFORMANCE_TERMS),
    ...(requirement.match(
      /\b\d+(?:\.\d+)?\s*%/g,
    ) ?? []),
  ]

  const performance = Array.from(
    new Set(performanceMatches),
  ).join(', ')

  const testing = containsAny(
    normalizedRequirement,
    TESTING_TERMS,
  ).join(', ')

  const marking = containsAny(
    normalizedRequirement,
    MARKING_TERMS,
  ).join(', ')

  const specialTerms = containsAny(normalizedRequirement, [
    'seismic',
    'fire resistant',
    'corrosion resistant',
    'weather resistant',
    'eco friendly',
    'environmental',
    'potable',
    'food grade',
  ])

  const specialRequirements = Array.from(
    new Set(specialTerms),
  ).join(', ')

    /*
   * Do NOT treat every unmatched word as an "other technical property".
   *
   * Generic requirement words such as:
   * "packaged", "water", "human", "consumption"
   * may be important to retrieval but are not automatically
   * technical properties.
   *
   * Other technical properties should only contain explicit
   * technical-looking phrases that are not already represented
   * by another structured field.
   */

  const TECHNICAL_PROPERTY_TERMS = [
    'ph',
    'tds',
    'turbidity',
    'chloride',
    'sulphate',
    'sulfate',
    'hardness',
    'alkalinity',
    'microbial',
    'microbiological',
    'bacterial',
    'coliform',
    'e coli',
    'temperature',
    'pressure',
    'strength',
    'density',
    'viscosity',
    'elongation',
    'tensile',
    'compressive',
    'impact',
    'hardness',
    'resistance',
    'corrosion resistance',
    'fire resistance',
    'purity',
    'sterility',
    'contamination',
    'composition',
  ]

  const explicitTechnicalProperties =
    containsAny(
      normalizedRequirement,
      TECHNICAL_PROPERTY_TERMS,
    )

  const otherTechnicalProperties =
    Array.from(
      new Set(explicitTechnicalProperties),
    )
      .filter(
        (term) =>
          ![
            performance,
            testing,
            marking,
            specialRequirements,
          ]
            .filter(Boolean)
            .some((field) =>
              normalize(field).includes(normalize(term)),
            ),
      )
      .join(', ')

  return {
    product,
    material,
    application,
    grade,
    dimensions,
    performance,
    testing,
    marking,
    specialRequirements,
    otherTechnicalProperties,
    keywords: tokenize(requirement),
  }
}

function exactCodeMatch(
  requirement: string,
  standard: Standard,
): boolean {
  const requirementNormalized = normalize(requirement)
  const codeNormalized = normalize(standard.code)

  if (!codeNormalized) {
    return false
  }

  return (
    requirementNormalized.includes(codeNormalized) ||
    requirementNormalized.includes(
      codeNormalized.replace(/\s+/g, ''),
    )
  )
}

/**
 * Score one standard using several independent signals.
 *
 * The score measures RELEVANCE only.
 * It is never presented as compliance.
 */
function scoreStandard(
  requirement: string,
  analysis: RequirementAnalysis,
  standard: Standard,
  semanticScore?: number,
): {
  score: number
  matchedConcepts: string[]
  matchedSignals: string[]
} {
  const title = normalize(standard.title)
  const category = normalize(standard.category)
  const domain = normalize(standard.application)
  const code = normalize(standard.code)
  const detailedMetadata = normalize(
  [
    standard.title,
    standard.scope,
    standard.material,
    standard.application,
    standard.testingRequirements.join(' '),
    standard.markingRequirements.join(' '),
    JSON.stringify(standard.technicalRequirements),
  ].join(' '),
)

 const requirementTokens = analysis.keywords

let points = 0
let possiblePoints = 0

const matchedConcepts: string[] = []
const matchedSignals: string[] = []

const normalizedRequirement = normalize(requirement)
const isPackagedDrinkingWater =
  normalizedRequirement.includes('packaged drinking water') ||
  normalizedRequirement.includes('packaged water') ||
  normalizedRequirement.includes('bottled water') ||
  normalizedRequirement.includes('water for human consumption')

const exactPhraseMatches = [
  'packaged drinking water',
  'packaged water',
  'drinking water',
  'natural mineral water',
  'food hygiene',
  'food safety',
].filter((phrase) =>
  normalizedRequirement.includes(phrase) &&
  detailedMetadata.includes(phrase),
)

if (exactPhraseMatches.length > 0) {
  points += exactPhraseMatches.length * 20
  possiblePoints += exactPhraseMatches.length * 20

  for (const phrase of exactPhraseMatches) {
    matchedConcepts.push(phrase)

    if (!matchedSignals.includes('Specific phrase match')) {
      matchedSignals.push('Specific phrase match')
    }
  }
}

  /**
   * Exact IS code match is the strongest possible signal.
   */
  if (exactCodeMatch(requirement, standard)) {
    points += 40
    possiblePoints += 40
    matchedConcepts.push(standard.code)
    matchedSignals.push('Exact IS code match')
  }

  /**
   * Title token overlap.
   */
  let titleMatches = 0

  for (const token of requirementTokens) {
    if (title.includes(token)) {
      titleMatches += 1
      matchedConcepts.push(token)
    }
  }

  const titlePossible = Math.max(
    requirementTokens.length * 3,
    1,
  )

  points += Math.min(titleMatches * 3, titlePossible)
  possiblePoints += titlePossible

  if (titleMatches > 0) {
    matchedSignals.push(
      `Title match (${titleMatches} keyword${titleMatches === 1 ? '' : 's'})`,
    )
  }
    /**
   * Specific multi-word phrase match.
   *
   * A phrase match is stronger evidence than separate keyword matches.
   */
  const queryWords = normalizedRequirement
    .split(/\s+/)
    .filter((word) => word.length >= 3)

  const phraseMatches = new Set<string>()

  for (let i = 0; i < queryWords.length - 1; i++) {
    const phrase = `${queryWords[i]} ${queryWords[i + 1]}`

    if (
      title.includes(phrase) ||
      detailedMetadata.includes(phrase)
    ) {
      phraseMatches.add(phrase)
    }
  }

  if (phraseMatches.size > 0) {
    const phrasePoints = Math.min(
      phraseMatches.size * 6,
      24,
    )

    points += phrasePoints
    possiblePoints += 24

    for (const phrase of phraseMatches) {
      if (!matchedConcepts.includes(phrase)) {
        matchedConcepts.push(phrase)
      }
    }

    matchedSignals.push(
      `Specific phrase match (${phraseMatches.size})`,
    )
  } else {
    possiblePoints += 24
  }

  /**
   * Product match.
   */
  if (
  analysis.product &&
  (title.includes(normalize(analysis.product)) ||
    detailedMetadata.includes(normalize(analysis.product)) ||
    category.includes(normalize(analysis.product)))
){
    points += 20
    possiblePoints += 20
    matchedConcepts.push(analysis.product)
    matchedSignals.push('Product match')
  } else {
    possiblePoints += 20
  }

  /**
   * Material match.
   */
 if (
  analysis.material &&
  (title.includes(normalize(analysis.material)) ||
    detailedMetadata.includes(normalize(analysis.material)) ||
    category.includes(normalize(analysis.material)) ||
    domain.includes(normalize(analysis.material)))
) {
    points += 15
    possiblePoints += 15
    matchedConcepts.push(analysis.material)
    matchedSignals.push('Material match')
  } else {
    possiblePoints += 15
  }

  /**
   * Application/domain match.
   */
  if (
    analysis.application &&
    (title.includes(normalize(analysis.application)) ||
      domain.includes(normalize(analysis.application)))
  ) {
    points += 15
    possiblePoints += 15
    matchedConcepts.push(analysis.application)
    matchedSignals.push('Application/domain match')
  } else {
    possiblePoints += 15
  }

  /**
   * Important technical terms.
   *
   * These contribute to relevance only when the terms actually occur
   * in the standard's available metadata.
   */
  const technicalTerms = [
    ...containsAny(requirement, PERFORMANCE_TERMS),
    ...containsAny(requirement, DIMENSION_TERMS),
    ...containsAny(requirement, TESTING_TERMS),
    ...containsAny(requirement, MARKING_TERMS),
    ...containsAny(requirement, [
      'seismic',
      'resistant',
      'durability',
      'strength',
      'reinforcement',
    ]),
  ]

  const uniqueTechnicalTerms = Array.from(
    new Set(technicalTerms),
  )

  for (const term of uniqueTechnicalTerms) {
    const normalizedTerm = normalize(term)

    if (
  title.includes(normalizedTerm) ||
  detailedMetadata.includes(normalizedTerm) ||
  category.includes(normalizedTerm) ||
  domain.includes(normalizedTerm)
) {
      points += 2
      matchedConcepts.push(term)

      if (!matchedSignals.includes('Technical-term match')) {
        matchedSignals.push('Technical-term match')
      }
    }
  }

  possiblePoints += Math.max(
    uniqueTechnicalTerms.length * 2,
    1,
  )

  /**
   * Category/domain token overlap provides a smaller supporting signal.
   */
  let contextualMatches = 0

 for (const token of requirementTokens) {
  if (
    title.includes(token) ||
    detailedMetadata.includes(token) ||
    category.includes(token) ||
    domain.includes(token) ||
    code.includes(token)
  ) {
      contextualMatches += 1

      if (!matchedConcepts.includes(token)) {
        matchedConcepts.push(token)
      }
    }
  }

  points += Math.min(contextualMatches * 1, 10)
  possiblePoints += 10

  const baseScore =
  possiblePoints > 0
    ? Math.min(points / possiblePoints, 1)
    : 0

let finalScore = baseScore


if (typeof semanticScore === 'number') {
  // Convert cosine similarity from [-1, 1] to [0, 1]
  const normalizedSemanticScore = Math.max(
  0,
  Math.min(semanticScore, 1),
)

  // Semantic similarity is the primary ranking signal.
  // Rule-based relevance provides a smaller refinement signal.
  finalScore =
    normalizedSemanticScore * 0.85 +
    baseScore * 0.15

  if (!matchedSignals.includes('Semantic similarity match')) {
    matchedSignals.push('Semantic similarity match')
  }
}
/*
 * Product-specific protection:
 * If the user explicitly asks for packaged/drinking water,
 * standards that actually describe packaged drinking water
 * should receive a strong relevance boost.
 *
 * This affects relevance ranking only.
 */
if (isPackagedDrinkingWater) {
  const waterProductMatch =
    title.includes('packaged drinking water') ||
    title.includes('packaged water') ||
    title.includes('drinking water') ||
    title.includes('bottled water') ||
    title.includes('mineral water') ||
    detailedMetadata.includes('packaged drinking water') ||
    detailedMetadata.includes('packaged water') ||
    detailedMetadata.includes('drinking water')

  if (waterProductMatch) {
    finalScore = Math.min(finalScore + 0.35, 1)

    if (!matchedSignals.includes('Specific product match')) {
      matchedSignals.push('Specific product match')
    }
  } else {
    /*
     * Prevent standards about unrelated uses of water
     * (for example concrete mixing) from outranking a
     * genuine drinking-water standard merely because
     * they contain the word "water".
     */
    if (
      title.includes('concrete') ||
      title.includes('cement') ||
      title.includes('wastewater') ||
      title.includes('sewage') ||
      title.includes('irrigation')
    ) {
      finalScore *= 0.35
    }
  }
}

  return {
    score: Number(finalScore.toFixed(2)),
    matchedConcepts: Array.from(
      new Set(matchedConcepts),
    ),
    matchedSignals: Array.from(
      new Set(matchedSignals),
    ),
  }
}

/**
 * Determine which parts of the user's request are actually supported
 * by the metadata available for the recommended standard.
 *
 * IMPORTANT:
 * A metadata match does NOT mean technical compliance.
 */
function createRequirementGap(
  analysis: RequirementAnalysis,
  standard: Standard,
): RequirementGapAnalysis {
  const items: RequirementGapItem[] = []
  const verified: string[] = []
  const unavailable: string[] = []
  const needsVerification: string[] = []

  const fieldText = (
    ...values: Array<string | undefined | null>
  ): string => {
    return normalize(
      values
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
        )
        .join(' '),
    )
  }

  const hasMatch = (
    requested: string,
    available: string,
  ): boolean => {
    const request = normalize(requested)
    const source = normalize(available)

    if (!request || !source) {
      return false
    }

    if (source.includes(request)) {
      return true
    }

    const tokens = tokenize(request).filter(
      (token) => token.length > 2,
    )

    if (tokens.length === 0) {
      return false
    }

    const matched = tokens.filter((token) =>
      source.includes(token),
    )

    /*
     * Require a meaningful portion of the request to match.
     * One generic word such as "water" should not be enough.
     */
    return (
      matched.length >= Math.max(
        1,
        Math.ceil(tokens.length * 0.5),
      )
    )
  }

  const addItem = (
    field: string,
    requestedValue: string,
    status: RequirementGapStatus,
    explanation: string,
  ) => {
    if (!requestedValue?.trim()) {
      return
    }

    const item: RequirementGapItem = {
      field,
      requestedValue,
      status,
      explanation,
    }

    items.push(item)

    const message =
      `${field}: "${requestedValue}" ${explanation}`

    if (status === 'available') {
      verified.push(message)
    } else if (status === 'unavailable') {
      unavailable.push(message)
    } else {
      needsVerification.push(message)
    }
  }

  /*
   * PRODUCT
   *
   * Product/category/title/scope are appropriate evidence for
   * identifying what the standard is about.
   */
  if (analysis.product) {
    const source = fieldText(
      standard.title,
      standard.category,
      standard.scope,
      standard.application,
      ...standard.applicableAreas,
    )

    if (hasMatch(analysis.product, source)) {
      addItem(
        'Product',
        analysis.product,
        'available',
        'is represented by the standard title, scope, category, or application metadata.',
      )
    } else {
      addItem(
        'Product',
        analysis.product,
        'unavailable',
        'is not explicitly represented in the available standard information.',
      )
    }
  }

  /*
   * MATERIAL
   */
  if (analysis.material) {
    const source = fieldText(
      standard.material,
      standard.technicalRequirements.material,
      standard.scope,
    )

    if (hasMatch(analysis.material, source)) {
      addItem(
        'Material',
        analysis.material,
        'available',
        'is represented in the available material/scope information.',
      )
    } else {
      addItem(
        'Material',
        analysis.material,
        'unavailable',
        'is not explicitly represented in the available material information.',
      )
    }
  }

  /*
   * APPLICATION
   */
  if (analysis.application) {
    const source = fieldText(
      standard.application,
      standard.scope,
      ...standard.applicableAreas,
    )

    if (hasMatch(analysis.application, source)) {
      addItem(
        'Application',
        analysis.application,
        'available',
        'is represented in the standard scope or application information.',
      )
    } else {
      addItem(
        'Application',
        analysis.application,
        'unavailable',
        'is not explicitly represented in the available application/scope information.',
      )
    }
  }

  /*
   * GRADE
   *
   * A mention is not enough to establish compliance.
   */
  if (analysis.grade) {
    const source = fieldText(
  standard.technicalRequirements.mechanicalProperties,
  standard.technicalRequirements.performance,
  standard.scope,
)

    if (hasMatch(analysis.grade, source)) {
      addItem(
        'Grade',
        analysis.grade,
        'needs-verification',
        'is mentioned in the available standard information, but the exact grade requirement must be verified against the applicable IS standard.',
      )
    } else {
      addItem(
        'Grade',
        analysis.grade,
        'unavailable',
        'could not be identified in the available standard information.',
      )
    }
  }

  /*
   * DIMENSIONS
   */
  if (analysis.dimensions) {
   const source = fieldText(
  standard.technicalRequirements.dimensions,
  standard.scope,
)

    if (hasMatch(analysis.dimensions, source)) {
      addItem(
        'Dimensions',
        analysis.dimensions,
        'needs-verification',
        'are represented in the available dimensional information, but exact dimensional compliance requires verification.',
      )
    } else {
      addItem(
        'Dimensions',
        analysis.dimensions,
        'unavailable',
        'could not be identified in the available dimensional information.',
      )
    }
  }

  /*
   * PERFORMANCE
   */
  if (analysis.performance) {
   const source = fieldText(
  standard.technicalRequirements.performance,
  standard.technicalRequirements.mechanicalProperties,
  standard.scope,
)

    if (hasMatch(analysis.performance, source)) {
      addItem(
        'Performance',
        analysis.performance,
        'needs-verification',
        'has related information in the available standard data, but the requested performance value must be verified against the detailed standard requirements.',
      )
    } else {
      addItem(
        'Performance',
        analysis.performance,
        'unavailable',
        'is not represented in the available performance information.',
      )
    }
  }

  /*
   * TESTING
   */
  if (analysis.testing) {
    const source = fieldText(
      standard.technicalRequirements.testing,
      standard.testingRequirements.join(' '),
      standard.scope,
    )

    if (hasMatch(analysis.testing, source)) {
      addItem(
        'Testing',
        analysis.testing,
        'needs-verification',
        'has related testing information available, but the exact applicable test method and acceptance requirements must be verified.',
      )
    } else {
      addItem(
        'Testing',
        analysis.testing,
        'unavailable',
        'is not represented in the available testing information.',
      )
    }
  }

  /*
   * MARKING
   */
  if (analysis.marking) {
    const source = fieldText(
      standard.technicalRequirements.marking,
      standard.markingRequirements.join(' '),
    )

    if (hasMatch(analysis.marking, source)) {
      addItem(
        'Marking',
        analysis.marking,
        'needs-verification',
        'has related marking information available, but the exact marking requirement must be verified.',
      )
    } else {
      addItem(
        'Marking',
        analysis.marking,
        'unavailable',
        'is not represented in the available marking information.',
      )
    }
  }

  /*
   * SPECIAL REQUIREMENTS
   */
  if (analysis.specialRequirements) {
    const source = fieldText(
      standard.scope,
      standard.application,
      standard.technicalRequirements.performance,
      standard.technicalRequirements.material,
      standard.technicalRequirements.testing,
      standard.technicalRequirements.marking,
    )

    if (hasMatch(analysis.specialRequirements, source)) {
      addItem(
        'Special requirements',
        analysis.specialRequirements,
        'needs-verification',
        'have related information in the available standard data, but the exact requirement must be verified against the applicable standard.',
      )
    } else {
      addItem(
        'Special requirements',
        analysis.specialRequirements,
        'unavailable',
        'are not explicitly represented in the available standard information.',
      )
    }
  }

  /*
   * OTHER TECHNICAL PROPERTIES
   */
  if (analysis.otherTechnicalProperties) {
    const source = fieldText(
      standard.scope,
      standard.application,
      standard.technicalRequirements.material,
      standard.technicalRequirements.dimensions,
      standard.technicalRequirements.performance,
      standard.technicalRequirements.testing,
      standard.technicalRequirements.marking,
    )

    if (hasMatch(analysis.otherTechnicalProperties, source)) {
      addItem(
        'Other technical properties',
        analysis.otherTechnicalProperties,
        'needs-verification',
        'have related information in the available standard data, but the exact technical requirement must be verified.',
      )
    } else {
      addItem(
        'Other technical properties',
        analysis.otherTechnicalProperties,
        'unavailable',
        'are not represented in the available standard information.',
      )
    }
  }

  return {
    items,
    verified: Array.from(new Set(verified)),
    unavailable: Array.from(new Set(unavailable)),
    needsVerification: Array.from(
      new Set(needsVerification),
    ),
  }
}

function buildExplanation(
  analysis: RequirementAnalysis,
  standard: Standard,
  matchedConcepts: string[],
  matchedSignals: string[],
): string {
  const reasons: string[] = []

  if (matchedSignals.includes('Exact IS code match')) {
    reasons.push(
      `the requested IS code matches ${standard.code}`,
    )
  }

  if (analysis.product) {
    const product = normalize(analysis.product)

    if (
      normalize(standard.title).includes(product) ||
      normalize(standard.category).includes(product)
    ) {
      reasons.push(
        `the product concept "${analysis.product}" appears in the available metadata`,
      )
    }
  }

  if (analysis.material) {
    const material = normalize(analysis.material)

    if (
      normalize(standard.title).includes(material) ||
      normalize(standard.category).includes(material) ||
      normalize(standard.application).includes(material)
    ) {
      reasons.push(
        `the material concept "${analysis.material}" appears in the available metadata`,
      )
    }
  }

  if (analysis.application) {
    const application = normalize(analysis.application)

    if (
      normalize(standard.title).includes(application) ||
      normalize(standard.application).includes(application)
    ) {
      reasons.push(
        `the application/domain concept "${analysis.application}" matches the available metadata`,
      )
    }
  }

  if (matchedConcepts.length > 0) {
    const concepts = matchedConcepts
      .slice(0, 8)
      .join(', ')

    reasons.push(
      `additional matching terms include: ${concepts}`,
    )
  }

  if (reasons.length === 0) {
    return `This standard was selected because its available title, category, or domain metadata has the strongest overall match to the supplied requirement.`
  }

  return `Recommended because ${reasons.join('; ')}. This is a relevance assessment based on available metadata, not a compliance determination.`
}

function toRecommendation(
  standard: Standard,
  score: number,
  matchedConcepts: string[],
  matchedSignals: string[],
  analysis: RequirementAnalysis,
): Recommendation {
  const gap = createRequirementGap(
    analysis,
    standard,
  )

  const explanation = buildExplanation(
    analysis,
    standard,
    matchedConcepts,
    matchedSignals,
  )

  return {
    standardId: standard.id,
    code: standard.code,
    title: standard.title,
    relevanceScore: score,
    whyRecommended: explanation,
    relevantSections: [],
    technicalRequirements:
      standard.technicalRequirements,
    requirementAnalysis: analysis,
    requirementGap: gap,
    evidence: {
      requirementSignal:
        matchedSignals.length > 0
          ? matchedSignals.join('; ')
          : 'Metadata relevance match',
      matchedConcepts,
      standardScope: standard.scope,
      supportingSections: [],
      extractedRequirements: gap.verified,
    },
  }
}

/**
 * Searches the complete loaded dataset and returns the strongest
 * relevant standards.
 */
export function rankStandards(
  requirement: string,
  semanticScores?: Map<string, number>,
): Recommendation[] {
  const cleanRequirement = requirement.trim()

  if (!cleanRequirement) {
    return []
  }

  const analysis =
    extractRequirement(cleanRequirement)

  const scored = STANDARDS.map((standard) => {
    const semanticScore = semanticScores?.get(
      normalize(standard.code),
    )
    

    const result = scoreStandard(
      cleanRequirement,
      analysis,
      standard,
      semanticScore,
    )

    return {
      standard,
      score: result.score,
      matchedConcepts: result.matchedConcepts,
      matchedSignals: result.matchedSignals,
    }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    /**
     * If relevance is tied, prefer current standards.
     */
    const aCurrent =
      a.standard.status === 'active' ? 1 : 0
    const bCurrent =
      b.standard.status === 'active' ? 1 : 0

    return bCurrent - aCurrent
  })

  return scored
    .filter((item) => item.score > 0)
    .slice(0, 5)
    .map(
      ({
        standard,
        score,
        matchedConcepts,
        matchedSignals,
      }) =>
        toRecommendation(
          standard,
          score,
          matchedConcepts,
          matchedSignals,
          analysis,
        ),
    )
}

/**
 * Direct IS-code lookup.
 *
 * Examples:
 *   searchStandards('IS 9417')
 *   searchStandards('9417')
 */
export function searchStandards(
  query: string,
): Standard[] {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return []
  }

  const codeQuery = normalizedQuery
    .replace(/\bis\b/g, '')
    .trim()

  const exactMatches = STANDARDS.filter((standard) => {
    const code = normalize(standard.code)
    const codeWithoutIs = code
      .replace(/\bis\b/g, '')
      .trim()

    return (
      code === normalizedQuery ||
      codeWithoutIs === codeQuery
    )
  })

  if (exactMatches.length > 0) {
    return exactMatches
  }

  const tokens = tokenize(query)

  return STANDARDS.filter((standard) => {
    const searchableText = normalize(
      [
        standard.code,
        standard.title,
        standard.category,
        standard.application,
      ].join(' '),
    )

    return tokens.some((token) =>
      searchableText.includes(token),
    )
  }).slice(0, 20)
}

/**
 * Search by title/category/domain keywords.
 */
export function searchStandardsByTitle(
  query: string,
): Standard[] {
  const tokens = tokenize(query)

  if (tokens.length === 0) {
    return []
  }

  const scored = STANDARDS.map((standard) => {
    const title = normalize(standard.title)
    const category = normalize(standard.category)
    const domain = normalize(standard.application)

    let score = 0

    for (const token of tokens) {
      if (title.includes(token)) {
        score += 3
      }

      if (category.includes(token)) {
        score += 2
      }

      if (domain.includes(token)) {
        score += 1
      }
    }

    return {
      standard,
      score,
    }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((item) => item.standard)
}

/**
 * Exposed only for diagnostics/testing.
 */
export function getStandardsDatasetSize(): number {
  return STANDARDS.length
}

/**
 * Get a single standard by its dataset ID.
 */
export function getStandardById(id: string): Standard | undefined {
  return STANDARDS.find((standard) => standard.id === id)
}