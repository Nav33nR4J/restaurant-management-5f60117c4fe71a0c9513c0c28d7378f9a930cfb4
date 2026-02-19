/**
 * Page: CartPage
 * Shopping cart screen
 */
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/atoms/Text';
import { CartCell } from '../../components/cells';
import { colors, spacing } from '../../utils/styles';

const CartPage: React.FC = memo(() => {
  const navigation = useNavigation<any>();

  const handleCheckout = useCallback(() => {
    navigation.navigate('Checkout');
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text variant="body" color={colors.primary}>← Back</Text>
        </TouchableOpacity>
        <Text variant="h2">Cart</Text>
        <View style={styles.placeholder} />
      </View>
      <CartCell onCheckout={handleCheckout} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.sm,
  },
  placeholder: {
    width: 60,
  },
});

export default CartPage;
