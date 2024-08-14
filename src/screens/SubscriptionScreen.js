import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SubscriptionScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Our Pricing Plans</Text>
      <Text style={styles.subHeader}>Pick a plan that is best for you</Text>

      <TouchableOpacity
        style={[
          styles.planContainer,
          selectedPlan === 'Basic' && styles.selectedPlanContainer,
        ]}
        onPress={() => setSelectedPlan('Basic')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Basic</Text>
          <Text style={styles.planPrice}>Free</Text>
        </View>
        <Text style={styles.planDescription}>Perfect plan for starters</Text>
        <Text style={styles.planDescription}>Get Emotions of your Dog</Text>
        <Text style={styles.planDescription}>Send Hugs and Voice Message to your Dg.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planContainer,
          selectedPlan === 'Standard' && styles.selectedPlanContainer,
        ]}
        onPress={() => setSelectedPlan('Standard')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Standard</Text>
          <Text style={styles.planPrice}>$20 HKD/Month</Text>
        </View>
        <Text style={styles.planDescription}>Find You Dog buddies in your area</Text>
        <Text style={styles.planDescription}>Faster Processing time</Text>
        <Text style={styles.planDescription}>Up to 3 Device Access</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planContainer,
          selectedPlan === 'Premium' && styles.selectedPlanContainer,
        ]}
        onPress={() => setSelectedPlan('Premium')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Premium</Text>
          <Text style={styles.planPrice}>50 HKD/Month</Text>
        </View>
        <Text style={styles.planDescription}>Zero restrictions when you go premium.</Text>
        <Text style={styles.planDescription}>One on One voice chat service between dog buddies.</Text>
        <Text style={styles.planDescription}>No need to wait in line for customer support.</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.buttonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
  },
  planContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  selectedPlanContainer: {
    borderColor: '#ff6f00',
    backgroundColor: '#ffecdf',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  subscribeButton: {
    backgroundColor: '#ff6f00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
