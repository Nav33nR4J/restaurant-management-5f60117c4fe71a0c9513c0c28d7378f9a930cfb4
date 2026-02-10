import { Pressable, Text, View } from "react-native";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { componentStyles } from "../styles";

export function MenuCard({
  id,
  name,
  price,
  theme,
}: {
  id: string;
  name: string;
  price: number;
  theme: any;
}) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const item = items.find((i) => i.id === id);
  const qty = item?.quantity ?? 0;

  return (
    <View
      style={[
        componentStyles.menuCard.container,
        {
          backgroundColor: theme.background,
          borderColor: theme.primary,
        },
      ]}
    >
      <Text style={{ color: theme.text, fontSize: 18 }}>{name}</Text>

      <View style={componentStyles.menuCard.content}>
        <Pressable
          onPress={() => dispatch(removeItem(id))}
          style={[
            componentStyles.menuCard.pressable,
            {
              backgroundColor: theme.primary,
              opacity: qty === 0 ? 0.4 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.text }}>−</Text>
        </Pressable>

        <Text
          style={[
            componentStyles.menuCard.quantity,
            { color: theme.text },
          ]}
        >
          {qty}
        </Text>

        <Pressable
          onPress={() => dispatch(addItem({ id, name, price }))}
          style={[
            componentStyles.menuCard.pressable,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={{ color: theme.text }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
