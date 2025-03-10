// Mock data for the MalariaDetect app

interface Sample {
  id: string;
  patientId: string;
  patientName: string;
  collectionTime: string;
  sampleType: string;
  labTechnician: string;
  status: string;
  priority: 'Routine' | 'Urgent';
}

export const mockSamples: Sample[] = [
    { 
      id: 'SM2403-001', 
      patientId: 'PT1001', 
      patientName: 'Alain Destin',
      collectionTime: '2025-03-09 08:15',
      sampleType: 'Thick blood smear',
      labTechnician: 'Dr. Bosco',
      status: 'Ready for analysis',
      priority: 'Routine'
    },
    { 
      id: 'SM2403-002', 
      patientId: 'PT1002', 
      patientName: 'Eric',
      collectionTime: '2025-03-09 09:30',
      sampleType: 'Thin blood smear',
      labTechnician: 'Dr. Aisha Kamau',
      status: 'Ready for analysis',
      priority: 'Urgent'
    },
    { 
      id: 'SM2403-003', 
      patientId: 'PT1003', 
      patientName: 'Eugenia',
      collectionTime: '2025-03-09 10:45',
      sampleType: 'Thick blood smear',
      labTechnician: 'Dr. Joseph Mutua',
      status: 'Ready for analysis',
      priority: 'Routine'
    },
    { 
      id: 'SM2403-004', 
      patientId: 'PT1004', 
      patientName: 'Idaya',
      collectionTime: '2025-03-09 11:20',
      sampleType: 'Thin blood smear',
      labTechnician: 'Dr. Joseph Mutua',
      status: 'In progress',
      priority: 'Routine'
    },
    { 
      id: 'SM2403-005', 
      patientId: 'PT1005', 
      patientName: 'Ahmed Issah',
      collectionTime: '2025-03-09 12:05',
      sampleType: 'Thick blood smear',
      labTechnician: 'Dr. Aisha Kamau',
      status: 'Completed',
      priority: 'Urgent'
    },
    { 
      id: 'SM2403-006', 
      patientId: 'PT1006', 
      patientName: 'Mariam',
      collectionTime: '2025-03-09 13:45',
      sampleType: 'Thin blood smear',
      labTechnician: 'Dr. Joseph Mutua',
      status: 'Ready for analysis',
      priority: 'Routine'
    }
  ];
  
  export const mockSampleDetails = {
    samples: mockSamples,
    details: [
      {
        sampleId: 'SM2403-001',
        stainType: 'Giemsa',
        stainTime: '10 minutes',
        microscope: 'Olympus CX43',
        objective: '100x oil immersion',
        fieldCount: '100 fields',
        qualityCheck: 'Passed',
        notes: 'Sample well-prepared. Staining quality is good with clear cellular definition.',
        slidePreparedBy: 'Jane Doe',
        prepTime: '2025-03-09 08:30'
      },
      {
        sampleId: 'SM2403-002',
        stainType: 'Field stain',
        stainTime: '15 minutes',
        microscope: 'Zeiss Primo Star',
        objective: '40x',
        fieldCount: '50 fields',
        qualityCheck: 'Passed',
        notes: 'Urgently needed for patient with severe symptoms. Sample has good quality.',
        slidePreparedBy: 'John Smith',
        prepTime: '2025-03-09 09:45'
      },
      {
        sampleId: 'SM2403-003',
        stainType: 'Giemsa',
        stainTime: '12 minutes',
        microscope: 'Olympus CX43',
        objective: '100x oil immersion',
        fieldCount: '100 fields',
        qualityCheck: 'Needs review',
        notes: 'Some areas of the smear appear too thick. May need to prepare a new slide.',
        slidePreparedBy: 'Jane Doe',
        prepTime: '2025-03-09 11:00'
      },
      {
        sampleId: 'SM2403-004',
        stainType: 'Field stain',
        stainTime: '8 minutes',
        microscope: 'Leica DM750',
        objective: '40x',
        fieldCount: '75 fields',
        qualityCheck: 'Passed',
        notes: 'Standard procedure followed. Good quality preparation.',
        slidePreparedBy: 'John Smith',
        prepTime: '2025-03-09 11:35'
      },
      {
        sampleId: 'SM2403-005',
        stainType: 'Giemsa',
        stainTime: '10 minutes',
        microscope: 'Olympus CX43',
        objective: '100x oil immersion',
        fieldCount: '100 fields',
        qualityCheck: 'Passed',
        notes: 'Urgent case. Patient presenting with high fever. Sample well-prepared.',
        slidePreparedBy: 'Jane Doe',
        prepTime: '2025-03-09 12:20'
      },
      {
        sampleId: 'SM2403-006',
        stainType: 'Field stain',
        stainTime: '15 minutes',
        microscope: 'Zeiss Primo Star',
        objective: '40x',
        fieldCount: '50 fields',
        qualityCheck: 'Failed',
        notes: 'Staining is uneven. Too much background staining. Need to prepare a new slide.',
        slidePreparedBy: 'John Smith',
        prepTime: '2025-03-09 14:00'
      }
    ]
  };
  
  export const mockAnalysisResults = {
    firstPass: {
      confidence: 78,
      parasitesDetected: true,
      parasiteCount: 12,
      stage: 'trophozoite',
      needsFullAnalysis: true
    },
    fullAnalysis: {
      confidence: 94,
      parasitesDetected: true,
      parasiteCount: 15,
      parasiteDensity: '2.3%',
      parasiteType: 'P. falciparum',
      stage: 'trophozoite',
      severity: 'Moderate'
    }
  };
  
  export const mockAnalysisHistory = [
    {
      id: 'AN001',
      sampleId: 'SM2403-001',
      timestamp: '2025-03-09 09:05',
      type: 'first-pass',
      result: {
        confidenceScore: 76,
        parasitesDetected: true,
        parasiteCount: 10,
        stage: 'trophozoite'
      },
      imageUri: '/assets/mock/sample1_analysis.jpg'
    },
    {
      id: 'AN002',
      sampleId: 'SM2403-001',
      timestamp: '2025-03-09 09:12',
      type: 'full',
      result: {
        confidenceScore: 92,
        parasitesDetected: true,
        parasiteCount: 14,
        parasiteDensity: '2.1%',
        parasiteType: 'P. falciparum',
        stage: 'trophozoite',
        severityScore: 'Moderate'
      },
      imageUri: '/assets/mock/sample1_full_analysis.jpg'
    },
    {
      id: 'AN003',
      sampleId: 'SM2403-005',
      timestamp: '2025-03-09 13:22',
      type: 'first-pass',
      result: {
        confidenceScore: 82,
        parasitesDetected: true,
        parasiteCount: 28,
        stage: 'schizont'
      },
      imageUri: '/assets/mock/sample5_analysis.jpg'
    },
    {
      id: 'AN004',
      sampleId: 'SM2403-005',
      timestamp: '2025-03-09 13:30',
      type: 'full',
      result: {
        confidenceScore: 96,
        parasitesDetected: true,
        parasiteCount: 32,
        parasiteDensity: '4.7%',
        parasiteType: 'P. falciparum',
        stage: 'schizont',
        severityScore: 'Severe'
      },
      imageUri: '/assets/mock/sample5_full_analysis.jpg'
    }
  ];