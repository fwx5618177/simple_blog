**Haute Concurrency : Ce que j'ai appris d'un entretien sur la conception de système avec Agoda**

Partage d'un entretien en tant que Senior Full Stack Engineer. Pour ma maîtrise de l'anglais, ce fut un moment difficile avec mon interlocuteur.

Je savais que j'allais être confronté à un défi lorsque j'ai pénétré dans la salle d'entretien. C'était le deuxième tour.

Alors que je me lançais dans le processus d'entretien pour le poste de Senior Full Stack chez Agoda, je savais très bien que le chemin à parcourir serait exigeant et complexe. L'accent mis sur la profondeur et l'étendue des technologies front-end et back-end signifiait que le processus d'entretien évoluerait naturellement en termes de complexité et d'attentes en matière de conception.

Cette réflexion plonge dans l'expérience immersive de mon entretien Senior Full Stack, offrant des aperçus sur les exigences techniques accrues et les aspects complexes de conception qui ont façonné l'évaluation. Naviguer dans ce processus a non seulement testé ma compétence technique, mais a également souligné l'importance de l'expertise globale à un niveau senior.

Mais l'élément important est que mon anglais parlé n'était pas suffisamment bon, et cela m'a coûté l'offre. La prochaine étape implique non seulement de perfectionner mes compétences techniques, mais aussi de me concentrer sur l'amélioration et l'optimisation de mes compétences en communication et en compétences douces.

## Le Processus d'Entretien

Tâche 1. Il s'agit simplement d'une tâche front-end simple. Elle décrit principalement les connaissances de base de React, useState, useEffect et debounce. Je pense que c'est facile pour moi.

Tâche 2. Conception de Système à Haute Concurrency : Comment afficher et stocker les nombres d'utilisateurs ? Surtout lorsqu'il y a un million d'utilisateurs et que 200 000 accèdent simultanément à une page de détails de produit. Comment concevoir le front-end et le back-end pour afficher le nombre sur la page de détails.

Quand j'ai reçu cette question, j'ai réalisé que la conception d'un système capable de gérer une telle haute concurrence est une entreprise complexe qui nécessite une réflexion minutieuse sur différents aspects.

J'ai donc décrit les étapes suivantes pour résoudre ce problème selon deux aspects :

1. Front-End

En ce qui concerne le front-end, le point clé est de fournir des mises à jour en temps réel aux utilisateurs sur le nombre d'individus qui consultent actuellement une page de détails de produit. Pour cela, j'ai proposé deux stratégies :

- Ressources statiques CDN. Placer toutes les ressources dans un CDN, telles que js, css, images, etc. Cela peut réduire la pression sur le serveur et améliorer l'expérience utilisateur. Si nous voulons réduire la taille des ressources, nous pouvons également utiliser un sprite pour combiner les images. Mais cela ne fait qu'améliorer les performances du site Web de manière simple, ce n'est pas le point clé.
- Websocket et SSE (Event-Source). Mettre à niveau directement le protocole http vers le protocole ws. Mettre en œuvre le protocole ws ou les connexions SSE pour faciliter la communication en temps réel entre le front-end et le back-end. Cela permet aux utilisateurs de recevoir des mises à jour instantanées sur les comptes d'utilisateurs au fur et à mesure qu'ils se produisent.

2. Back-End

Le back-end est au cœur de la gestion des comptes d'utilisateurs et de la fourniture efficace de données en temps réel. Pour relever les défis de haute concurrence, j'ai proposé les stratégies suivantes :

- Equilibrage de charge et passerelle API. Utiliser des équilibreurs de charge et une passerelle API pour distribuer le trafic entrant sur plusieurs serveurs et instances de back-end. Cela garantit que le back-end peut gérer le volume élevé de demandes et les servir efficacement, en évitant que des composants individuels ne deviennent un goulot d'étranglement.
  - On dirait que nous pourrions définir une limite de taux (Rate-Limiting) dans la passerelle API pour éviter que

le back-end ne soit submergé par trop de demandes. Je pense que cela pourrait maintenir la stabilité du back-end.

- Architecture de microservices.
  - Mécanisme de mise en cache. Intégrer un mécanisme de mise en cache en mémoire pour stocker les nombres d'utilisateurs. Comme Redis, il pourrait récupérer rapidement et efficacement les données de comptage. Cela pourrait réduire la charge sur la base de données et améliorer les temps de réponse.
  - **Après avoir discuté avec un ami, Redis prend également en charge des mécanismes de persistance. Tels que le fichier Append-Only (AOF) et les instantanés Redis Database (RDB). En cas de défaillance du serveur, nous pouvons récupérer les données en lisant les fichiers journaux.**
  - Base de données pour les données historiques. Utilisation directe d'une base de données pour stocker les données historiques de comptage des utilisateurs, permettant ainsi l'analyse et les insights sur les tendances de comportement des utilisateurs.
  - API Restful + MQ (Message Queue). Utilisation d'une combinaison d'API Restful et d'une file d'attente de messages (MQ) pour gérer les demandes du front-end. Interaction efficace avec les services backend et assurance de la communication asynchrone pour la diffusion des mises à jour. Cette approche est bénéfique pour gérer une haute concurrence et de grands volumes de demandes. Elle permet également la scalabilité et la flexibilité dans la gestion des demandes. En réalité, il s'agit de comptage d'utilisateurs.
  - ProtoBuf RPC. Utilisation de ProtoBuf RPC pour communiquer entre les microservices. Mais pendant l'entretien, j'ai oublié le nom exact de `ProtoBuf`, finalement je l'ai décrit comme un `protocole de tampon binaire`. Je pense que c'était une grosse erreur. Mettre en place une base de données temporaire pour stocker les données ProtoBuf, ainsi qu'une variable d'état de drapeau pour indiquer la disponibilité de la consommation ou si les données ont déjà été consommées, améliore la cohérence des données et aide à gérer efficacement le flux de données. **Cette méthode qui ajoute un drapeau dans le contexte du RPC est généralement bien adaptée à une architecture basée sur les événements. Elle prend en charge les communications asynchrones et la flexibilité. L'état du drapeau est particulièrement adapté aux scénarios où plusieurs actions se produisent simultanément. Il peut signifier différents états, comme `prêt pour`, `consommation`, `traitement`, `consommé`.**

## Points Oubliés

En conclusion, j'ai omis plusieurs considérations importantes.

1. Assurer la cohérence des données et la correction des opérations concurrentes. Je devais expliquer les mécanismes tels que les verrous, les transactions et les niveaux d'isolation pour résoudre ces défis, ce qui aurait renforcé davantage mes preuves.
2. Considération approfondie des algorithmes d'équilibrage de charge, des stratégies de mise en cache, de la conception des API et de la sélection de la file d'attente de messages. Aborder les différents algorithmes d'équilibrage de charge, discuter des politiques d'invalidation du cache, élaborer sur les principes de conception des API RESTful et comparer les différentes options de file d'attente de messages démontrerait une compréhension plus complète des subtilités de la conception de systèmes.
3. Gestion des Connexions WebSocket et Gestion des Ressources en Haute Concurrency. Ne pas avoir expliqué comment gérer efficacement les connexions WebSocket et gérer l'utilisation des ressources pendant les périodes de haute concurrence. Discuter de techniques telles que le pool de connexions, le throttling et la surveillance des ressources mettrait en évidence les compétences pour gérer les défis pratiques.

# Conclusion

En fin de compte, je pense que je n'ai pas eu une bonne performance lors de l'entretien. Je dois donc encore améliorer mon anglais parlé. Et j'ai aussi besoin d'en apprendre davantage sur la conception de systèmes. Je pense que c'est une bonne façon d'améliorer ma capacité à résoudre des problèmes.
