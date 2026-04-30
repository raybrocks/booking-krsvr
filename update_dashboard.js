const fs = require('fs');
const content = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

const newCode = `          {(() => {
            if (activeTab === "archive") {
              return renderBookingsTable(filteredAndSortedBookings);
            }

            // For upcoming tab, split into Today, Tomorrow, Upcoming
            const now = new Date(currentTime);
            const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
            
            const tomorrow = new Date(currentTime);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowStr = \`\${tomorrow.getFullYear()}-\${String(tomorrow.getMonth() + 1).padStart(2, '0')}-\${String(tomorrow.getDate()).padStart(2, '0')}\`;

            const todayBookings = filteredAndSortedBookings.filter(b => b.date === todayStr);
            const tomorrowBookings = filteredAndSortedBookings.filter(b => b.date === tomorrowStr);
            const upcomingBookings = filteredAndSortedBookings.filter(b => b.date > tomorrowStr);

            return (
              <div className="space-y-8">
                {renderBookingsTable(todayBookings, "Today")}
                {renderBookingsTable(tomorrowBookings, "Tomorrow")}
                {renderBookingsTable(upcomingBookings, "Upcoming")}
              </div>
            );
          })()}
`;

// It is lines 389 to 497 inclusive.
// Array splice: start index (388), delete count (109), items to add...
lines.splice(388, 109, newCode.slice(0, -1));

fs.writeFileSync('components/AdminDashboard.tsx', lines.join('\n'));
