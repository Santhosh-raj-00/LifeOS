import jsPDF from 'jspdf';

export const downloadJournalPDF = (entry, userName = 'User') => {
  if (!entry) return;

  const doc = new jsPDF();
  const primaryColor = [79, 70, 229]; // Indigo #4F46E5
  const textColor = [30, 41, 59];     // Slate 800 #1E293B

  // Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LifeOS - Daily Journal Entry', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const entryDate = entry.date || new Date().toISOString().split('T')[0];
  const lockStatus = entry.locked ? 'Locked (Finalized)' : 'Editable (Today)';
  doc.text(`Date: ${entryDate}   |   Author: ${userName}   |   Status: ${lockStatus}`, 14, 29);

  let y = 48;

  const sections = [
    { title: '1. What I Did Today', content: entry.contentWhatIDid },
    { title: '2. What I Learned', content: entry.contentWhatILearned },
    { title: '3. Wins & Achievements', content: entry.contentWins },
    { title: '4. Mistakes & Slip-ups', content: entry.contentMistakes },
    { title: '5. Tomorrow\'s Goals', content: entry.contentTomorrowGoals },
  ];

  sections.forEach((sec) => {
    // Page height check
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Section Header Bar
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(14, y, 182, 9, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 9, 'S');

    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sec.title, 18, y + 6.5);

    y += 13;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);

    const textContent = (sec.content && sec.content.trim()) ? sec.content.trim() : 'No reflection written for this section.';
    const splitText = doc.splitTextToSize(textContent, 175);

    // If section content exceeds remaining page height
    if (y + (splitText.length * 5) > 275) {
      doc.addPage();
      y = 20;
    }

    doc.text(splitText, 18, y);
    y += splitText.length * 5 + 10;
  });

  // Footer Branding
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Generated via LifeOS Personal Discipline System • ${new Date().toLocaleDateString()}`, 14, 285);

  doc.save(`LifeOS_Journal_${entryDate}.pdf`);
};
