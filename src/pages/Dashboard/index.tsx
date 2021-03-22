import { useCallback, useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodInterface {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<FoodInterface[]>([]);
  const [editingFood, setEditingFood] = useState<FoodInterface>({} as FoodInterface);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleAddFood = useCallback(
    async (food) => {
      try {
        const { data: foodsData } = await api.post('/foods', {
          ...food,
          available: true,
        });

        setFoods([...foods, foodsData]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food) => {
      try {
        const { data: foodUpdated } = await api.put(
          `/foods/${editingFood.id}`,
          { ...editingFood, ...food },
        );

        const foodsUpdated = foods.map((f) =>
          f.id !== foodUpdated.id ? f : foodUpdated,
        );

        setFoods(foodsUpdated);
      } catch (err) {
        console.log(err);
      }
    },
    [editingFood, foods],
  );

  const handleDeleteFood = useCallback(
    async (id) => {
      await api.delete(`/foods/${id}`);

      const foodsFiltered = foods.filter((food) => food.id !== id);

      setFoods(foodsFiltered);
    },
    [foods],
  );

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback((food) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }, []);

  useEffect(() => {
    const loadFoods = async () => {
      const { data: foodsData } = await api.get('/foods');

      setFoods(foodsData);
    };

    loadFoods();
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
