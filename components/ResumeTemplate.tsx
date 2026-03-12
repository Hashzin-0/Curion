'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';

export type ResumeData = {
  name: string;
  firstName: string;
  lastName: string;
  profession: string;
  phone: string;
  email: string;
  availableSince: string;
  photoUrl?: string;
  summary?: string;
  experiences: {
    company: string;
    role: string;
    duration: string;
  }[];
  skills: {
    name: string;
    description: string;
  }[];
};

type Props = {
  data: ResumeData;
  theme: ResumeTheme;
  profileUrl?: string;
};

function DottedLine({ color }: { color: string }) {
  return (
    <span
      style={{
        flex: 1,
        borderBottom: `2px dotted ${color}`,
        margin: '0 8px',
        marginBottom: '4px',
        opacity: 0.5,
      }}
    />
  );
}

const ResumeTemplate = forwardRef<HTMLDivElement, Props>(function ResumeTemplate(
  { data, theme, profileUrl },
  ref
) {
  const nameParts = data.name.toUpperCase().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ') || '';

  return (
    <div
      ref={ref}
      id="resume-template"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#fff',
        fontFamily: "'Arial Black', Arial, sans-serif",
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top stripe */}
      <div style={{ height: '12px', backgroundColor: theme.primaryColor }} />

      {/* Header */}
      <div
        style={{
          backgroundColor: theme.primaryColor,
          padding: '20px 32px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          position: 'relative',
        }}
      >
        {/* Photo */}
        {data.photoUrl && (
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              border: `3px solid ${theme.secondaryColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src={data.photoUrl}
              alt={data.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Name block */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '42px',
              fontWeight: '900',
              lineHeight: 1,
              color: theme.accentColor,
              letterSpacing: '-1px',
              textShadow: `2px 2px 0px ${theme.secondaryColor}`,
            }}
          >
            {firstName}
          </div>
          <div
            style={{
              fontSize: '38px',
              fontWeight: '900',
              lineHeight: 1.1,
              color: theme.accentColor,
              textShadow: `2px 2px 0px ${theme.secondaryColor}`,
            }}
          >
            {restName}
          </div>
        </div>

        {/* Header emoji */}
        <div
          style={{
            fontSize: '64px',
            lineHeight: 1,
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))',
          }}
        >
          {theme.headerEmoji}
        </div>
      </div>

      {/* Second stripe */}
      <div style={{ height: '8px', backgroundColor: theme.secondaryColor }} />

      {/* Contact bar */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: `2px solid ${theme.primaryColor}`,
        }}
      >
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {data.profession}
        </div>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700' }}>
          <span style={{ fontSize: '20px' }}>{theme.summaryEmoji}</span>
          <span>{data.availableSince}</span>
        </div>
        {data.phone && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd' }} />
            <div style={{ fontSize: '14px', fontWeight: '700' }}>{data.phone}</div>
          </>
        )}
      </div>

      {/* Summary section */}
      <div
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          backgroundColor: '#fafafa',
          borderBottom: `3px solid ${theme.primaryColor}`,
        }}
      >
        <div style={{ fontSize: '48px', lineHeight: 1, flexShrink: 0 }}>{theme.summaryEmoji}</div>
        <p
          style={{
            fontSize: '12px',
            fontWeight: '700',
            lineHeight: 1.6,
            color: '#222',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            margin: 0,
          }}
        >
          {data.summary}
        </p>
      </div>

      {/* Experiences section */}
      <div style={{ padding: '0 32px' }}>
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0 16px',
          }}
        >
          <div
            style={{
              backgroundColor: theme.secondaryColor,
              borderRadius: '10px',
              width: '52px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}
          >
            {theme.experienceEmoji}
          </div>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#ddd' }} />
          <h2
            style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            EXPERIÊNCIAS
          </h2>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#ddd' }} />
        </div>

        {/* Experience items */}
        <div style={{ marginBottom: '8px' }}>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontWeight: '900',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {exp.company}
                </span>
                <span style={{ fontSize: '14px', color: theme.secondaryColor, margin: '0 4px' }}>
                  {theme.bulletEmoji}
                </span>
                <DottedLine color={theme.accentColor} />
                <span
                  style={{
                    fontWeight: '900',
                    fontSize: '13px',
                    letterSpacing: '3px',
                    whiteSpace: 'nowrap',
                    color: '#222',
                  }}
                >
                  {exp.duration.toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#555',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  paddingLeft: '8px',
                  marginTop: '2px',
                }}
              >
                {exp.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills section */}
      <div style={{ padding: '0 32px' }}>
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0 16px',
          }}
        >
          <div
            style={{
              backgroundColor: theme.secondaryColor,
              borderRadius: '10px',
              width: '52px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}
          >
            {theme.skillEmoji}
          </div>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#ddd' }} />
          <h2
            style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            COMPETÊNCIAS
          </h2>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#ddd' }} />
        </div>

        {/* Skill items */}
        <div style={{ marginBottom: '8px' }}>
          {data.skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px', color: theme.secondaryColor }}>{theme.bulletEmoji}</span>
                <DottedLine color={theme.accentColor} />
                <span
                  style={{
                    fontWeight: '900',
                    fontSize: '13px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: '#1a1a1a',
                  }}
                >
                  {skill.name}
                </span>
              </div>
              {skill.description && (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#666',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    paddingLeft: '24px',
                    marginTop: '2px',
                  }}
                >
                  ({skill.description})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stripe */}
      <div style={{ height: '6px', backgroundColor: theme.primaryColor, marginTop: '16px' }} />
      <div style={{ height: '4px', backgroundColor: theme.secondaryColor }} />

      {/* Footer */}
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontWeight: '900',
            fontSize: '16px',
            letterSpacing: '1px',
          }}
        >
          {data.email}
        </div>
        {profileUrl && (
          <div style={{ backgroundColor: '#fff', padding: '4px', borderRadius: '6px' }}>
            <QRCodeSVG value={profileUrl} size={64} />
          </div>
        )}
      </div>
    </div>
  );
});

export default ResumeTemplate;
