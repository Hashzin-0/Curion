'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { ResumeData } from './ResumeTemplate';
import { ResumeTheme } from '@/ai/flows/generate-resume-theme-flow';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 900 },
  ],
});

export function VectorResume({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 0,
      fontFamily: 'Inter',
    },
    header: {
      backgroundColor: theme.primaryColor,
      padding: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: 10,
    },
    nameBlock: {
      flex: 1,
    },
    firstName: {
      fontSize: 32,
      fontWeight: 900,
      color: theme.textOnPrimary,
      textTransform: 'uppercase',
    },
    lastName: {
      fontSize: 24,
      fontWeight: 900,
      color: theme.textOnPrimary,
      opacity: 0.9,
      textTransform: 'uppercase',
    },
    contactBar: {
      padding: '10 30',
      borderBottomWidth: 2,
      borderBottomColor: theme.primaryColor,
      flexDirection: 'row',
      gap: 15,
      fontSize: 10,
      fontWeight: 700,
      color: '#555',
    },
    section: {
      padding: '20 30',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 900,
      color: '#1A1A1A',
      marginBottom: 10,
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
      paddingBottom: 5,
    },
    item: {
      marginBottom: 10,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    company: {
      fontSize: 12,
      fontWeight: 900,
      textTransform: 'uppercase',
    },
    duration: {
      fontSize: 10,
      fontWeight: 700,
      color: theme.primaryColor,
    },
    role: {
      fontSize: 10,
      color: '#666',
      fontWeight: 700,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    summary: {
      fontSize: 10,
      lineHeight: 1.5,
      color: '#333',
      marginBottom: 20,
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {data.photoUrl && <Image src={data.photoUrl} style={styles.photo} />}
          <View style={styles.nameBlock}>
            <Text style={styles.firstName}>{data.firstName}</Text>
            <Text style={styles.lastName}>{data.lastName}</Text>
          </View>
        </View>

        <View style={styles.contactBar}>
          <Text>{data.profession}</Text>
          {data.phone && <Text>|  {data.phone}</Text>}
          {data.email && <Text>|  {data.email}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Profissional</Text>
          <Text style={styles.summary}>{data.summary}</Text>

          {data.experiences.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Experiências</Text>
              {data.experiences.map((exp, i) => (
                <View key={i} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.company}>{exp.company}</Text>
                    <Text style={styles.duration}>{exp.duration}</Text>
                  </View>
                  <Text style={styles.role}>{exp.role}</Text>
                </View>
              ))}
            </>
          )}

          {data.education && data.education.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Formação</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.company}>{edu.institution}</Text>
                    <Text style={styles.duration}>{edu.period}</Text>
                  </View>
                  <Text style={styles.role}>{edu.course}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}