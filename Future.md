```md
├── src/
│   ├── core/                 # Color science fundamentals
│   │   ├── hct/             # HCT color space impl
│   │   ├── blending/        # Color blending logic
│   │   └── contrast/        # Contrast calculations
│   ├── features/
│   │   ├── quantization/    # Image processing
│   │   ├── theme-generation/# Material theme creation
│   │   └── scheme-tools/    # Color scheme utilities
│   ├── adapters/
│   │   ├── node/            # Node-specific implementations
│   │   └── browser/         # Browser-specific code
│   ├── types/               # TS type definitions
│   └── utils/               # Shared utilities
├── test/
│   ├── unit/
│   │   ├── core/
│   │   └── features/
│   └── integration/
│       ├── adapters/
├── scripts/                  # Build/CI scripts
├── docs/                     # Documentation
│   ├── api/
│   └── examples/
└── config/                   # Tooling configs
```