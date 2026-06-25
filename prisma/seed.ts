import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create test candidate
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      password: await hash('password123', 12),
      userType: 'candidate',
      firstName: 'John',
      lastName: 'Doe',
      accountStatus: 'verified',
      bio: 'Passionate software engineer looking for my next opportunity',
      locationCity: 'San Francisco',
      locationState: 'CA'
    }
  })

  const candidate = await prisma.candidate.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      degreeType: 'Bachelor',
      degreeField: 'Computer Science',
      schoolName: 'UC Berkeley',
      gpa: 3.8,
      topSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      softSkills: ['Leadership', 'Communication', 'Problem Solving'],
      preferredRoles: ['Software Engineer', 'Full Stack Developer'],
      preferredLocations: ['San Francisco', 'Remote'],
      willingToRelocate: false
    }
  })

  // Create test recruiter
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      password: await hash('password123', 12),
      userType: 'recruiter',
      firstName: 'Jane',
      lastName: 'Smith',
      accountStatus: 'verified',
      bio: 'Hiring manager at Tech Company'
    }
  })

  // Create test company
  const company = await prisma.company.upsert({
    where: { primaryContactUserId: recruiterUser.id },
    update: {},
    create: {
      primaryContactUserId: recruiterUser.id,
      companyName: 'Tech Startup Inc',
      website: 'https://techstartup.com',
      industry: 'Software Development',
      companySize: '51-200',
      description: 'We build innovative software products',
      isVerified: true,
      verificationStatus: 'verified'
    }
  })

  // Create test job (idempotent: avoid duplicates when re-seeding)
  const existingJob = await prisma.jobListing.findFirst({
    where: { companyId: company.id, jobTitle: 'Senior Software Engineer' },
  })
  const job = existingJob ?? await prisma.jobListing.create({
    data: {
      companyId: company.id,
      jobTitle: 'Senior Software Engineer',
      jobDescription: 'We are looking for a senior engineer to join our team',
      salaryMin: 150000,
      salaryMax: 200000,
      salaryCurrency: 'USD',
      requiredDegree: 'Bachelor',
      targetLocations: ['San Francisco', 'Remote'],
      remoteOption: 'hybrid',
      willingToTrain: false,
      isActive: true
    }
  })

  // Create candidate pool (idempotent)
  await prisma.candidatePool.upsert({
    where: { jobListingId_candidateId: { jobListingId: job.id, candidateId: candidate.id } },
    update: {},
    create: {
      jobListingId: job.id,
      candidateId: candidate.id,
      matchScore: 0.92,
      matchReason: { meetsDegree: true, meetsGpa: true, hasSkills: true, locationMatch: true }
    }
  })

  console.log('✅ Database seeded with test data')
  console.log('Test credentials:')
  console.log('- Candidate: candidate@example.com / password123')
  console.log('- Recruiter: recruiter@example.com / password123')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })