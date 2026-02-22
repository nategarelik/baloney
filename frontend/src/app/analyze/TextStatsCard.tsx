"use client";

interface TextStats {
  word_count: number;
  sentence_count: number;
  avg_word_length: number;
  avg_sentence_length: number;
  lexical_diversity: number;
}

interface TextStatsCardProps {
  textStats: TextStats;
  charCount?: number;
}

export function TextStatsCard({ textStats, charCount }: TextStatsCardProps) {
  const stats = [
    { label: "Words", value: textStats.word_count },
    { label: "Sentences", value: textStats.sentence_count },
    {
      label: "Avg Word Length",
      value: `${textStats.avg_word_length.toFixed(1)} chars`,
    },
    {
      label: "Avg Sentence Length",
      value: `${textStats.avg_sentence_length.toFixed(1)} words`,
    },
    {
      label: "Lexical Diversity",
      value: `${(textStats.lexical_diversity * 100).toFixed(0)}%`,
    },
    {
      label: "Characters",
      value: charCount?.toLocaleString() || "\u2014",
    },
  ];

  return (
    <div className="bg-base-dark rounded-xl border border-secondary/10 p-6">
      <h3 className="font-display text-xl text-secondary mb-4">
        Text Statistics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-secondary/5 rounded-lg p-3 text-center"
          >
            <div className="text-secondary/50 text-xs uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="font-display text-xl text-secondary">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
