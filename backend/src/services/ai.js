import axios from 'axios';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Call OpenAI Chat Completion (gpt-3.5-turbo by default to save cost).
 */
async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const { data } = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('OpenAI error:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

/**
 * Generate a detailed AI code review.
 * Falls back to a heuristic review if OpenAI is unavailable.
 */
export async function generateReview(repoUrl, analysisData) {
  const systemPrompt = `You are a senior software engineer performing a code review. Be constructive, specific, and actionable. Format your review with clear sections using markdown headers.`;

  const userPrompt = `Review this GitHub repository: ${repoUrl}

Repository Analysis Data:
- Overall Score: ${analysisData.overallScore}/100
- Scores: ${JSON.stringify(analysisData.scores)}
- Tech Stack: ${(analysisData.techStack || []).join(', ')}
- File Count: ${analysisData.fileCount || 'N/A'}
- Issues Found: ${(analysisData.issues || []).length}
${analysisData.issues?.length > 0 ? '\nIssues:\n' + analysisData.issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.title} in ${i.file}`).join('\n') : ''}
- Summary: ${analysisData.summary || ''}

Provide a comprehensive code review covering:
1. Architecture & Structure
2. Code Quality
3. Security Concerns
4. Documentation
5. Recommendations for Improvement`;

  const aiReview = await callOpenAI(systemPrompt, userPrompt);
  if (aiReview) return aiReview;

  // ---------- Heuristic fallback ----------
  return buildHeuristicReview(repoUrl, analysisData);
}

/**
 * Generate a summary for the repo using AI or fallback.
 */
export async function generateSummary(repoUrl, analysisData) {
  const systemPrompt = `You are a technical writer. Write a concise 2-3 sentence summary of the repository.`;
  const userPrompt = `Summarize this repository: ${repoUrl}\nTech: ${(analysisData.techStack || []).join(', ')}\nDescription: ${analysisData.repoInfo?.description || 'N/A'}`;

  const aiSummary = await callOpenAI(systemPrompt, userPrompt);
  return aiSummary || analysisData.summary || 'No summary available.';
}

/* ---------- Heuristic fallback review ---------- */

function buildHeuristicReview(repoUrl, data) {
  const lines = [];
  const s = data.scores || {};

  lines.push(`# Code Review: ${repoUrl.split('/').slice(-2).join('/')}`);
  lines.push('');
  lines.push(`**Overall Score: ${data.overallScore}/100**`);
  lines.push('');

  // Architecture
  lines.push('## 🏗️ Architecture & Structure');
  if (s.structure >= 80) {
    lines.push('The project demonstrates a well-organized directory structure with clear separation of concerns. Source code is logically grouped, making it easy for new contributors to navigate.');
  } else if (s.structure >= 60) {
    lines.push('The project structure is reasonable but could benefit from better organization. Consider grouping related files into feature modules and ensuring consistent naming conventions.');
  } else {
    lines.push('The project structure needs improvement. Files appear loosely organized. Consider adopting a standard project layout for the framework being used and separating concerns into distinct directories.');
  }
  lines.push('');

  // Code Quality
  lines.push('## 🔍 Code Quality');
  if (s.maintainability >= 80) {
    lines.push('Code quality indicators are strong. The project includes linting configuration and follows consistent patterns. Tests are present, which is excellent for long-term maintainability.');
  } else if (s.maintainability >= 60) {
    lines.push('Code quality is acceptable but has room for improvement. Consider adding linting tools (ESLint, Prettier) and increasing test coverage to catch potential issues early.');
  } else {
    lines.push('Code quality could be significantly improved. There are no linting configurations or test files detected. Adding automated code formatting, static analysis, and tests would greatly enhance maintainability.');
  }
  lines.push('');

  // Security
  lines.push('## 🔒 Security');
  const highIssues = (data.issues || []).filter((i) => i.severity === 'high');
  const medIssues = (data.issues || []).filter((i) => i.severity === 'medium');
  if (highIssues.length === 0 && medIssues.length === 0) {
    lines.push('No significant security concerns were detected during static analysis. The codebase appears to follow reasonable security practices.');
  } else {
    lines.push(`Static analysis found **${highIssues.length} high-severity** and **${medIssues.length} medium-severity** issue(s):`);
    lines.push('');
    for (const issue of [...highIssues, ...medIssues]) {
      lines.push(`- **[${issue.severity.toUpperCase()}]** ${issue.title} — \`${issue.file}\``);
      if (issue.description) lines.push(`  ${issue.description}`);
    }
    lines.push('');
    lines.push('It is strongly recommended to address high-severity issues before deployment.');
  }
  lines.push('');

  // Documentation
  lines.push('## 📝 Documentation');
  if (s.documentation >= 80) {
    lines.push('Documentation is comprehensive. The project includes a README, license, and additional documentation files, making it accessible to new contributors and users.');
  } else if (s.documentation >= 60) {
    lines.push('Documentation is present but could be more thorough. Consider adding API documentation, contribution guidelines, and a changelog to improve the developer experience.');
  } else {
    lines.push('Documentation is lacking. At minimum, ensure a comprehensive README with setup instructions, a LICENSE file, and inline code comments for complex logic.');
  }
  lines.push('');

  // Recommendations
  lines.push('## 💡 Recommendations');
  lines.push('');
  const recs = [];
  if (s.structure < 80) recs.push('Reorganize the project structure following framework-specific best practices.');
  if (s.maintainability < 80) recs.push('Add linting and formatting tools (ESLint, Prettier, or Biome).');
  if (s.documentation < 80) recs.push('Improve documentation — add a detailed README, API docs, and contribution guide.');
  if (s.security < 80) recs.push('Address all detected security issues, especially hardcoded secrets and injection risks.');
  if (!(data.techStack || []).some((t) => t.toLowerCase().includes('docker'))) recs.push('Consider containerizing the application with Docker for consistent deployments.');
  recs.push('Implement CI/CD pipelines for automated testing and deployment.');
  recs.push('Add comprehensive test coverage (aim for >80%).');

  recs.forEach((r, i) => lines.push(`${i + 1}. ${r}`));

  return lines.join('\n');
}
