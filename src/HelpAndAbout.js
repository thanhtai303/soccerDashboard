import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

const HelpAndAboutScreen = () => {
  const [activeTab, setActiveTab] = useState('help'); // 'help' or 'about'

  const HelpContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I reset my password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            Where can I view my account details?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>Email: support@example.com</Text>
          <Text style={styles.contactText}>Phone: +1 (555) 123-4567</Text>
          <Text style={styles.contactText}>Hours: Mon-Fri, 9AM-5PM EST</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Version</Text>
        <Text style={styles.versionText}>1.0.0</Text>
      </View>
    </View>
  );

  const AboutContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.description}>
          Welcome to Tai Xiu! We are dedicated to providing you with the best
          experience possible. Our mission is to make your life easier.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.featureText}>• User-friendly interface</Text>
        <Text style={styles.featureText}>• Regular updates</Text>
        <Text style={styles.featureText}>• 24/7 support</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Info</Text>
        <Text style={styles.infoText}>Company: Thanh Tai Nguyen</Text>
        <Text style={styles.infoText}>Founded: 2025</Text>
        <Text
          style={[styles.infoText, styles.link]}
          onPress={() => Linking.openURL('https://www.example.com')}>
          Website: www.example.com
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <Text
          style={[styles.infoText, styles.link]}
          onPress={() => Linking.openURL('https://www.example.com/privacy')}>
          Privacy Policy
        </Text>
        <Text
          style={[styles.infoText, styles.link]}
          onPress={() => Linking.openURL('https://www.example.com/terms')}>
          Terms of Service
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Thanh Tai Nguyen
        </Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'help' && styles.activeTab]}
          onPress={() => setActiveTab('help')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'help' && styles.activeTabText,
            ]}>
            Help & Support
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'about' && styles.activeTabText,
            ]}>
            About
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'help' ? <HelpContent /> : <AboutContent />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'grey',
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  faqItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  faqQuestion: {
    fontSize: 16,
  },
  contactInfo: {
    padding: 5,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 5,
  },
  versionText: {
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  link: {
    color: '#000',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HelpAndAboutScreen;
