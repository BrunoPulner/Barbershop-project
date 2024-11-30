import prismaClient from "../../prisma";

interface HaircutRequest {
  user_id: string;
  name: string;
  price: number;
}

//Verificar se ele é premium se não limitamos a quantidade de modelos para cadastrar

class CreateHaircutService {
  async execute({ user_id, name, price }: HaircutRequest) {
    if (!name || !price) {
      throw new Error("Error! Contate ao administrador.");
    }

    //Verificar quantos modelos esse usuario já tem cadastrado
    const myHaircuts = await prismaClient.haircut.count({
      where: {
        user_id: user_id,
      },
    });

    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      include: {
        subscriptions: true,
      },
    });

    //Podemos agora criar nossa validação ou limite
    if (myHaircuts >= 3 && user?.subscriptions?.status !== "active") {
      throw new Error("Você atingiu o limite de itens de uma conta free!");
    }

    const haircut = await prismaClient.haircut.create({
      data: {
        name: name,
        price: price,
        user_id: user_id,
      },
    });

    return haircut;
  }
}

export { CreateHaircutService };
