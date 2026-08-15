/**
 * Test Script: Segmented Planning System
 * 
 * Tests all 12 section agents and the orchestrator end-to-end
 * 
 * Usage:
 *   npm run ts-node scripts/test-segmented-planning.ts [projectId] [userEmail]
 * 
 * Or create a test project first:
 *   npm run ts-node scripts/test-segmented-planning.ts --create-test
 */

import { SegmentedPlanningOrchestrator } from '../lib/services/segmented-planning-orchestrator';
import { VibeProjectModel } from '../lib/models/VibeProject';
import { BuildSessionModel } from '../lib/models/BuildSession';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

const TEST_USER_EMAIL = 'test@example.com';

async function createTestProject() {
  console.log('\n📝 Creating test project...');
  
  await connectToDatabase();
  
  const project = await VibeProjectModel.create({
    name: 'Student Expense Tracker',
    description: 'Build a simple web app that helps students track their daily expenses, categorize spending, and set monthly budgets. Students should be able to quickly add expenses, see where their money goes, and stay within budget.',
    type: 'web',
    framework: 'Next.js',
    userId: TEST_USER_EMAIL,
  });
  
  console.log('✅ Test project created!');
  console.log(`   ID: ${project._id}`);
  console.log(`   Name: ${project.name}`);
  console.log(`   Type: ${project.type}`);
  
  return project;
}

async function testSegmentedPlanning(projectId: string, userEmail: string) {
  console.log('\n🚀 Starting segmented planning test...');
  console.log(`   Project ID: ${projectId}`);
  console.log(`   User: ${userEmail}`);
  
  await connectToDatabase();
  
  // Verify project exists
  const project = await VibeProjectModel.findById(projectId, userEmail);
  if (!project) {
    throw new Error('Project not found');
  }
  
  console.log(`\n✅ Project found: ${project.name}`);
  
  // Create orchestrator
  const orchestrator = new SegmentedPlanningOrchestrator();
  
  // Start planning
  console.log('\n▶️  Starting segmented planning...');
  const session = await orchestrator.startPlanGeneration({
    projectId,
    userId: userEmail,
  });
  
  console.log(`✅ Planning session started!`);
  console.log(`   Session ID: ${session._id}`);
  console.log(`   Status: ${session.status}`);
  
  // Poll for progress
  console.log('\n📊 Monitoring progress...\n');
  
  let complete = false;
  let lastCompletedCount = 0;
  const startTime = Date.now();
  
  while (!complete) {
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get progress
    const progress = await orchestrator.getProgress(
      session._id.toString(),
      userEmail
    );
    
    const completedCount = progress.completedSections.length;
    
    // Show new completions
    if (completedCount > lastCompletedCount) {
      const newSections = progress.completedSections.slice(lastCompletedCount);
      for (const sectionId of newSections) {
        const section = progress.session.artifacts?.segmentedPlan?.sectionsData[
          sectionId as keyof typeof progress.session.artifacts.segmentedPlan.sectionsData
        ];
        
        if (section) {
          console.log(`✓ ${section.name}`);
          console.log(`  ${section.simpleExplanation.substring(0, 120)}...`);
          console.log(`  Model: ${section.aiUsage?.model || 'unknown'}`);
          console.log(`  Cost: $${section.aiUsage?.cost.toFixed(6) || '0'}`);
          console.log('');
        }
      }
      lastCompletedCount = completedCount;
    }
    
    // Check status
    const status = progress.status;
    console.log(`   Progress: ${progress.progress}% | Status: ${status} | Sections: ${completedCount}/12`);
    
    if (status === 'completed') {
      complete = true;
    } else if (status === 'failed') {
      console.error('\n❌ Planning failed!');
      return;
    }
    
    // Timeout after 5 minutes
    if (Date.now() - startTime > 300000) {
      console.error('\n⏰ Timeout after 5 minutes');
      return;
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n🎉 Planning complete!');
  console.log(`   Duration: ${duration}s`);
  console.log(`   Sections: ${lastCompletedCount}/12`);
  
  // Show final summary
  const finalSession = await BuildSessionModel.findById(
    new ObjectId(session._id),
    userEmail
  );
  
  if (finalSession?.artifacts?.segmentedPlan) {
    const plan = finalSession.artifacts.segmentedPlan;
    
    console.log('\n📋 Plan Summary:');
    
    // Calculate total cost
    let totalCost = 0;
    let totalTokens = 0;
    
    Object.values(plan.sectionsData).forEach((section: any) => {
      if (section?.aiUsage) {
        totalCost += section.aiUsage.cost || 0;
        totalTokens += section.aiUsage.tokensUsed || 0;
      }
    });
    
    console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
    console.log(`   Total Tokens: ${totalTokens}`);
    console.log(`   Status: ${plan.status}`);
    
    // Show understanding
    if (plan.sectionsData.projectUnderstanding) {
      console.log('\n💡 Project Understanding:');
      console.log(`   ${plan.sectionsData.projectUnderstanding.simpleExplanation}`);
    }
    
    // Show features count
    if (plan.sectionsData.coreFeatures?.data?.features) {
      const features = plan.sectionsData.coreFeatures.data.features;
      console.log(`\n🎯 Features: ${features.length}`);
      features.slice(0, 3).forEach((f: any, i: number) => {
        console.log(`   ${i + 1}. ${f.name} (${f.priority})`);
      });
    }
    
    // Show tech stack
    if (plan.sectionsData.techStack?.data?.framework) {
      console.log(`\n⚙️  Tech Stack:`);
      console.log(`   Framework: ${plan.sectionsData.techStack.data.framework.name}`);
      console.log(`   Database: ${plan.sectionsData.techStack.data.database?.name || 'N/A'}`);
    }
  }
  
  console.log('\n✅ Test complete!\n');
}

async function testSingleSection() {
  console.log('\n🧪 Testing single section agent...');
  
  await connectToDatabase();
  
  // Import agent directly
  const { ProjectUnderstandingAgent } = await import('../lib/agents/planning/project-understanding-agent');
  const { AIRouter } = await import('../lib/ai-router');
  const { getUserPlan } = await import('../lib/subscription');
  
  const agent = new ProjectUnderstandingAgent(new AIRouter());
  
  // Create minimal context
  const userPlan = await getUserPlan(TEST_USER_EMAIL);
  const mockProject = {
    _id: new ObjectId(),
    name: 'Test Project',
    description: 'A simple todo list app for students to organize their assignments and deadlines',
    type: 'web' as const,
    status: 'planning' as const,
    userId: TEST_USER_EMAIL,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const mockSession = {
    _id: new ObjectId(),
    projectId: mockProject._id,
    userId: TEST_USER_EMAIL,
    status: 'planning' as const,
    phase: 'requirements' as const,
    progress: 0,
    startedAt: new Date(),
    buildConfig: {
      autoApprove: false,
      generateTests: false,
      runSecurityScan: true,
      buildMode: 'standard' as const,
    },
    results: {
      filesGenerated: 0,
      linesOfCode: 0,
      agentsUsed: [],
      tasksCompleted: 0,
      tasksFailed: 0,
    },
    artifacts: {
      segmentedPlan: {
        status: 'generating' as const,
        completedSections: [],
        sectionsData: {},
        checkpoints: {},
      },
    },
    aiUsage: {
      totalRequests: 0,
      totalTokens: 0,
      estimatedCost: 0,
      byAgent: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const context = {
    session: mockSession,
    project: mockProject,
    user: {
      email: TEST_USER_EMAIL,
      plan: userPlan,
    },
    generatedFiles: new Map(),
    currentPhase: 'planning' as const,
    budget: {
      maxTokens: 50000,
      usedTokens: 0,
      maxCost: 10,
      usedCost: 0,
    },
  };
  
  console.log('\n▶️  Executing ProjectUnderstandingAgent...');
  
  try {
    const output = await agent.execute(context);
    
    console.log('\n✅ Agent executed successfully!');
    console.log(`   Provider: ${output.aiUsage.provider}`);
    console.log(`   Model: ${output.aiUsage.model}`);
    console.log(`   Input Tokens: ${output.aiUsage.inputTokens}`);
    console.log(`   Output Tokens: ${output.aiUsage.outputTokens}`);
    console.log(`   Cost: $${output.aiUsage.cost.toFixed(6)}`);
    
    const section = output.data.section;
    console.log(`\n📝 Section Output:`);
    console.log(`   ID: ${section.id}`);
    console.log(`   Name: ${section.name}`);
    console.log(`   Status: ${section.status}`);
    console.log(`   Explanation: ${section.simpleExplanation}`);
    console.log(`   Data: ${JSON.stringify(section.data, null, 2).substring(0, 200)}...`);
    
    console.log('\n✅ Single section test passed!\n');
  } catch (error) {
    console.error('\n❌ Agent execution failed!');
    console.error(error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  try {
    if (args.includes('--create-test')) {
      // Create test project
      const project = await createTestProject();
      console.log(`\n📝 To test planning, run:`);
      console.log(`   npm run ts-node scripts/test-segmented-planning.ts ${project._id} ${TEST_USER_EMAIL}`);
      
    } else if (args.includes('--single')) {
      // Test single agent
      await testSingleSection();
      
    } else if (args.length >= 2) {
      // Run full test with provided project
      const [projectId, userEmail] = args;
      await testSegmentedPlanning(projectId, userEmail);
      
    } else {
      // Show usage
      console.log('\n📖 Usage:');
      console.log('   Create test project:');
      console.log('   npm run ts-node scripts/test-segmented-planning.ts --create-test\n');
      console.log('   Test single agent:');
      console.log('   npm run ts-node scripts/test-segmented-planning.ts --single\n');
      console.log('   Test full planning:');
      console.log('   npm run ts-node scripts/test-segmented-planning.ts [projectId] [userEmail]\n');
    }
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error(error);
    process.exit(1);
  }
}

main();
