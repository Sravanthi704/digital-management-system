const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/adminModel');
const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Registration = require('./models/registrationModel');
const Feedback = require('./models/feedbackModel');
const generateTicket = require('./utils/generateTicket');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed function
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create admin
    console.log('\n👨‍💼 Creating admin...');
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      orgName: 'Event Management Inc.',
      location: 'San Francisco, CA'
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // Create users
    console.log('\n👥 Creating users...');
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123', location: 'New York, NY' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', location: 'Los Angeles, CA' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'password123', location: 'Chicago, IL' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', password: 'password123', location: 'Houston, TX' },
      { name: 'David Brown', email: 'david@example.com', password: 'password123', location: 'Miami, FL' }
    ];
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create events (mix of paid and free)
    console.log('\n📅 Creating events...');
    const eventsData = [
      {
        title: 'Tech Innovation Summit 2024',
        description: 'Join us for a day of cutting-edge technology discussions, featuring industry leaders and innovative startups.',
        date: new Date('2024-12-15'),
        time: '09:00',
        category: 'Technology',
        location: 'Convention Center, San Francisco',
        isPaid: true,
        price: 99,
        maxSeats: 200,
        bookedSeats: 0,
        status: 'upcoming',
        createdBy: admin._id
      },
      {
        title: 'Business Networking Breakfast',
        description: 'Start your day with meaningful connections! This networking event brings together entrepreneurs and business leaders.',
        date: new Date('2024-12-20'),
        time: '08:00',
        category: 'Business',
        location: 'Grand Hotel, Downtown',
        isPaid: false,
        price: 0,
        maxSeats: 100,
        bookedSeats: 0,
        status: 'upcoming',
        createdBy: admin._id
      },
      {
        title: 'React & Next.js Workshop',
        description: 'Hands-on workshop for developers interested in mastering React and Next.js.',
        date: new Date('2024-12-18'),
        time: '14:00',
        category: 'Education',
        location: 'Tech Hub, Main Campus',
        isPaid: true,
        price: 49,
        maxSeats: 50,
        bookedSeats: 0,
        status: 'upcoming',
        createdBy: admin._id
      },
      {
        title: 'Summer Music Festival',
        description: 'Experience the biggest music festival of the year! Featuring top artists across multiple genres.',
        date: new Date('2024-12-25'),
        time: '12:00',
        category: 'Entertainment',
        location: 'Central Park, New York',
        isPaid: true,
        price: 149,
        maxSeats: 500,
        bookedSeats: 0,
        status: 'upcoming',
        createdBy: admin._id
      },
      {
        title: 'Marathon Challenge 2024',
        description: 'Annual city marathon with routes for all fitness levels.',
        date: new Date('2024-12-22'),
        time: '06:00',
        category: 'Sports',
        location: 'City Stadium, Starting Line',
        isPaid: false,
        price: 0,
        maxSeats: 1000,
        bookedSeats: 0,
        status: 'upcoming',
        createdBy: admin._id
      }
    ];
    const createdEvents = await Event.insertMany(eventsData);
    console.log(`✅ Created ${createdEvents.length} events`);

    // Create registrations with payment status and tickets
    console.log('\n🎫 Creating registrations...');
    const registrations = [];

    // User 1 (John) - registers for paid and free events
    registrations.push({
      user: createdUsers[0]._id,
      event: createdEvents[0]._id, // Paid event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });
    registrations.push({
      user: createdUsers[0]._id,
      event: createdEvents[1]._id, // Free event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });

    // User 2 (Jane) - registers for multiple events
    registrations.push({
      user: createdUsers[1]._id,
      event: createdEvents[0]._id, // Paid event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });
    registrations.push({
      user: createdUsers[1]._id,
      event: createdEvents[2]._id, // Paid event (unpaid initially)
      paymentStatus: 'unpaid'
    });
    registrations.push({
      user: createdUsers[1]._id,
      event: createdEvents[4]._id, // Free event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });

    // User 3 (Mike)
    registrations.push({
      user: createdUsers[2]._id,
      event: createdEvents[2]._id, // Paid event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });
    registrations.push({
      user: createdUsers[2]._id,
      event: createdEvents[3]._id, // Paid event (unpaid)
      paymentStatus: 'unpaid'
    });

    // User 4 (Sarah)
    registrations.push({
      user: createdUsers[3]._id,
      event: createdEvents[1]._id, // Free event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });
    registrations.push({
      user: createdUsers[3]._id,
      event: createdEvents[3]._id, // Paid event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });

    // User 5 (David)
    registrations.push({
      user: createdUsers[4]._id,
      event: createdEvents[0]._id, // Paid event
      paymentStatus: 'paid',
      ticketCode: generateTicket()
    });

    const createdRegistrations = await Registration.insertMany(registrations);
    console.log(`✅ Created ${createdRegistrations.length} registrations`);

    // Update event booked seats
    for (const reg of createdRegistrations) {
      await Event.findByIdAndUpdate(reg.event, { $inc: { bookedSeats: 1 } });
    }

    // Create feedbacks
    console.log('\n💬 Creating feedbacks...');
    const feedbacks = [
      {
        event: createdEvents[0]._id,
        user: createdUsers[0]._id,
        rating: 5,
        comment: 'Amazing event! Learned a lot about new technologies.'
      },
      {
        event: createdEvents[0]._id,
        user: createdUsers[1]._id,
        rating: 4,
        comment: 'Great speakers and content. Would attend again.'
      },
      {
        event: createdEvents[2]._id,
        user: createdUsers[2]._id,
        rating: 5,
        comment: 'Excellent workshop! Very hands-on and practical.'
      },
      {
        event: createdEvents[1]._id,
        user: createdUsers[0]._id,
        rating: 4,
        comment: 'Good networking opportunities.'
      },
      {
        event: createdEvents[4]._id,
        user: createdUsers[1]._id,
        rating: 5,
        comment: 'Well organized marathon!'
      }
    ];
    const createdFeedbacks = await Feedback.insertMany(feedbacks);
    console.log(`✅ Created ${createdFeedbacks.length} feedbacks`);

    // Display summary
    console.log('\n📊 Seed Data Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`👨‍💼 Admins: 1`);
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📅 Events: ${createdEvents.length}`);
    console.log(`   - Paid: ${createdEvents.filter(e => e.isPaid).length}`);
    console.log(`   - Free: ${createdEvents.filter(e => !e.isPaid).length}`);
    console.log(`🎫 Registrations: ${createdRegistrations.length}`);
    console.log(`   - Paid: ${createdRegistrations.filter(r => r.paymentStatus === 'paid').length}`);
    console.log(`   - Unpaid: ${createdRegistrations.filter(r => r.paymentStatus === 'unpaid').length}`);
    console.log(`💬 Feedbacks: ${createdFeedbacks.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@gmail.com');
    console.log('     Password: admin123');
    console.log('   Users:');
    console.log('     Email: john@example.com / jane@example.com / mike@example.com / sarah@example.com / david@example.com');
    console.log('     Password: password123');
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();
