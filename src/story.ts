// Control panel definition - mirrors the original '3D Tracking' fragment's story.
export interface ControlDef {
  prop: string
  control: 'switch'|'slider'|'segmented'|'number'|'color'|'text'
  label?: string
  default?: unknown
  min?: number
  max?: number
  step?: number
  options?: string[]
  visibleWhen?: { prop: string; equals: unknown }
}

export interface SectionDef { title: string | null; controls: ControlDef[] }

export const STORY: SectionDef[] = [
  {
    "title": null,
    "controls": [
      {
        "prop": "polarity",
        "control": "segmented",
        "options": [
          "dark",
          "light"
        ]
      },
      {
        "prop": "tracks",
        "control": "slider",
        "label": "Detections",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "prop": "churn",
        "control": "slider",
        "label": "Churn",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "prop": "fps",
        "control": "slider",
        "label": "Frame rate",
        "min": 8,
        "max": 30,
        "step": 1
      },
      {
        "prop": "labels",
        "control": "switch",
        "label": "x / y / z callouts"
      },
      {
        "prop": "ascii",
        "control": "switch",
        "label": "ASCII fill"
      },
      {
        "prop": "follow",
        "control": "switch",
        "label": "Follow cursor"
      }
    ]
  },
  {
    "title": "3D",
    "controls": [
      {
        "prop": "depth",
        "control": "slider",
        "label": "Depth",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "prop": "autoRotate",
        "control": "slider",
        "label": "Auto-rotate",
        "min": -0.5,
        "max": 0.5,
        "step": 0.01
      },
      {
        "prop": "stage",
        "control": "switch",
        "label": "Floor grid + axes"
      },
      {
        "prop": "gridOpacity",
        "control": "slider",
        "label": "Grid opacity",
        "min": 0,
        "max": 0.5,
        "step": 0.01,
        "visibleWhen": {
          "prop": "stage",
          "equals": true
        }
      }
    ]
  },
  {
    "title": "Bloom",
    "controls": [
      {
        "prop": "bloom",
        "control": "slider",
        "label": "Intensity",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "prop": "bloomRadius",
        "control": "slider",
        "label": "Radius",
        "min": 2,
        "max": 40,
        "step": 1
      }
    ]
  },
  {
    "title": "Connections",
    "controls": [
      {
        "prop": "connectors",
        "control": "switch",
        "label": "Show"
      },
      {
        "prop": "bend",
        "control": "slider",
        "label": "Bend",
        "min": 0,
        "max": 2,
        "step": 0.05,
        "visibleWhen": {
          "prop": "connectors",
          "equals": true
        }
      },
      {
        "prop": "bendSpread",
        "control": "slider",
        "label": "Bend variation",
        "min": 0,
        "max": 1,
        "step": 0.05,
        "visibleWhen": {
          "prop": "connectors",
          "equals": true
        }
      },
      {
        "prop": "linkWeight",
        "control": "slider",
        "label": "Line weight",
        "min": 0.5,
        "max": 3,
        "step": 0.25,
        "visibleWhen": {
          "prop": "connectors",
          "equals": true
        }
      },
      {
        "prop": "linkOpacity",
        "control": "slider",
        "label": "Opacity",
        "min": 0.1,
        "max": 1,
        "step": 0.05,
        "visibleWhen": {
          "prop": "connectors",
          "equals": true
        }
      },
      {
        "prop": "arrows",
        "control": "switch",
        "label": "Arrowheads",
        "visibleWhen": {
          "prop": "connectors",
          "equals": true
        }
      }
    ]
  },
  {
    "title": "Colour",
    "controls": [
      {
        "prop": "asciiColor",
        "control": "color",
        "label": "ASCII"
      },
      {
        "prop": "accent",
        "control": "color",
        "label": "Accent"
      }
    ]
  }
]

// the values the original page shipped with
export const PUBLISHED: Record<string, unknown> = {
  "polarity": "dark",
  "tracks": 13,
  "churn": 0,
  "fps": 30,
  "connectors": true,
  "bend": 0.15,
  "bendSpread": 1,
  "linkWeight": 1,
  "linkOpacity": 0.4,
  "arrows": true,
  "labels": true,
  "ascii": true,
  "asciiColor": "#ffffff",
  "accent": "#ffffff",
  "follow": false,
  "depth": 2,
  "autoRotate": -0.11,
  "stage": true,
  "gridOpacity": 0.15,
  "bloom": 0.55,
  "bloomRadius": 11
}
