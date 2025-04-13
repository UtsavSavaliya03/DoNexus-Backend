const cron = require('node-cron');
const Task = require('../Models/Task/Task.js');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAILER_EMAIL, // generated ethereal user
    pass: process.env.MAILER_EMAIL_PASS, // generated ethereal password
  },
});

// Function to send reminder emails
const sendReminderEmails = async () => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find tasks due tomorrow
    const tasksDueTomorrow = await Task.find({
      dueDate: {
        $gte: new Date(`${tomorrowStr}T00:00:00.000Z`),
        $lte: new Date(`${tomorrowStr}T23:59:59.999Z`)
      },
      isCompleted: false
    }).populate('userId', 'email fName lName');

    // Group tasks by user
    const tasksByUser = {};
    tasksDueTomorrow.forEach(task => {
      if (!tasksByUser[task.userId._id]) {
        tasksByUser[task.userId._id] = {
          user: task.userId,
          tasks: []
        };
      }
      tasksByUser[task.userId._id].tasks.push(task);
    });

    // Send email to each user
    for (const userId in tasksByUser) {
      const { user, tasks } = tasksByUser[userId];

      const taskList = tasks.map(task =>
        `- ${task.title} (Due: ${task.dueDate.toLocaleDateString()})`
      ).join('\n');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Reminder: Tasks Due Tomorrow',
        text: `Hello ${user.fName} ${user?.lName},\n\nYou have the following tasks due tomorrow:\n\n${taskList}\n\nBest regards,\nDoNexus`,
        html: `<!DOCTYPE html>
               <html>
                 <head>
                   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                   <title>Welcome to HealthHorizon!</title>
                   <style>
                     body {
                       background-color: #f2f2f2;
                       font-family: Arial, sans-serif;
                     }
                     .container {
                       margin: 0 auto;
                     }
                     .header {
                       background: linear-gradient(90deg, rgb(13, 3, 213) 0%, rgb(12, 12, 195) 26%, rgba(0, 212, 255, 1) 100%);        color: white;
                       padding: 20px;
                       text-align: center;
                     }
                     .content {
                       background: linear-gradient(to bottom right, #ffffff, #f2f2f2);
                       padding: 20px;
                       font-size: 18px;
                       line-height: 1.5;
                       color: #333333;
                       text-align: justify;
                     }
                     .footer {
                       background: linear-gradient(90deg, rgb(13, 3, 213) 0%, rgb(12, 12, 195) 26%, rgba(0, 212, 255, 1) 100%);        color: #666666;
                       font-size: 14px;
                       text-align: center;
                       padding: 20px;
                     }
                   </style>
                 </head>
                 <body>
                   <div class="container">
                     <div class="header">
                       <h1>DoNexus</h1>
                     </div>
                     <div class="content">
                       <p>Dear ${user.fName} ${user?.lName},</p>
                       <p>
                          <p>You have the following tasks due tomorrow:</p>
                          <ul>${tasks.map(task => `<li>${task.title} (Due: ${task.dueDate.toLocaleDateString()})</li>`).join('')}</ul>
                       <p>Best regards,<br/>DoNexus</p>
                     </div>
               
                     <div class="footer">
                       <div style="color: white; font-weight: 600">
                         <p>
                           You received this email because you have some pending task at DoNexus.
                         </p>
                       </div>
                     </div>
                   </div>
                 </body>
               </html>`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${user.email}`);
    }

    console.log(`Reminder emails sent for ${tasksDueTomorrow.length} tasks`);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }
};

// Schedule the job to run daily at 12 AM
const startReminderService = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily task reminder check...');
    sendReminderEmails();
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });

  console.log('Task reminder service started');
};

module.exports = { startReminderService };