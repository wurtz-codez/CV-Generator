export const COVER_LETTER_PROMPT = (resume: string, jd: string) => {
  const clf = `
**[Name extracted from the given resume]**
[Address from Resume]  
[Contact number from Resume] 
[Email ID from Resume]  

[Recipient's Name (if known)]  
[Company's Name]  
[Company's Address if available]  

Dear Hiring Manager,

Introduction Paragraph: 
Specify the job title
Mention where you found the listing
Express enthusiasm for the role and company
Mention referral (if applicable)

Body Paragraph(s):
Highlight relevant skills
Describe work experience
Outline quantifiable achievements
Align qualifications with job requirements

Points Section : [Not in bold letter] Include 3 notable achievement/skills that outcasts other candidates, choose those bullet points with respect to the job role and requirements. Make the points concise and clear. You can make points from experience and project section both.  

Closing Paragraph:
Emphasize potential contributions
Thank the hiring manager
Include a call to action for an interview

Closing (e.g., "Sincerely," "Warm regards,")
[Name information mentioned in Resume Text]
[LinkedIn link extracted from Resume Text] (if applicable)
`;

  return `Write a cover letter for the following job description:\n\n${jd}\n\nUsing the following resume as reference:\n\n${resume}\n\nCover Letter. The cover letter should strictly follow the below format:\n\n${clf}\n\nWhatever you are generating in bold put it in between **text**. The tone should be professional, enthusiastic, and confident. Highlight key skills and experiences from the resume that align with the job requirements. Focus on showcasing how my qualifications and accomplishments make me an ideal fit for the role. Use strong action verbs and results-oriented language. Emphasize my passion for the role and how I can contribute to the company's goals. Ensure the entire output is ready to use without placeholders like "[Company Name]" where the actual name can be deduced.`;
};

export const PARSE_JD_METADATA_PROMPT = (jd: string) => `
From this job description extract the job title and company name.
Return ONLY a JSON object like: {"jobTitle":"...","company":"..."}
No markdown, no explanation, no backticks.
Job description: ${jd.slice(0, 600)}
`;
