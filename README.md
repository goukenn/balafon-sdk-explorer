# balafon-php-sdk-viewer


# Wiki : Format du fichier de Schema JSON - SDK 

**Auteur :** C.A.D BONDJE DOUE
**Date :** 2026-02-24
**Version :** 1.0

---

## Table des matieres

1. [Introduction](#1-introduction)
2. [Vue d'ensemble du fichier](#2-vue-densemble-du-fichier)
3. [Statistiques du SDK](#3-statistiques-du-sdk)
4. [Les cles de configuration globale (`::`)](#4-les-cles-de-configuration-globale)
   - [::class](#41-class)
   - [::interface](#42-interface)
   - [::trait](#43-trait)
   - [::conditionals_functions](#44-conditionals_functions)
   - [::files](#45-files)
   - [::namespaces](#46-namespaces)
   - [::meta](#47-meta)
5. [Definition d'une classe](#5-definition-dune-classe)
   - [Proprietes de la classe](#51-proprietes-de-la-classe)
   - [Methodes (funcs)](#52-methodes-funcs)
   - [Proprietes PHP (props)](#53-proprietes-php-props)
   - [Modificateurs de classe](#54-modificateurs-de-classe)
6. [Definition d'une interface](#6-definition-dune-interface)
7. [Definition d'un trait](#7-definition-dun-trait)
8. [Fonctions globales](#8-fonctions-globales)
9. [Fonctions conditionnelles](#9-fonctions-conditionnelles)
10. [Specification des fonctions et methodes](#10-specification-des-fonctions-et-methodes)
    - [Parametres](#101-parametres)
    - [Type de retour](#102-type-de-retour)
    - [Methodes statiques](#103-methodes-statiques)
    - [PHPDoc](#104-phpdoc)
11. [Le champ `$r` (reference index)](#11-le-champ-r-reference-index)
12. [Nommage et namespaces dans les cles](#12-nommage-et-namespaces-dans-les-cles)
13. [Resume complet des cles](#13-resume-complet-des-cles)
14. [Exemples complets](#14-exemples-complets)

---

## 1. Introduction

Le fichier de schema JSON du **SDK ** est un fichier de description structurel exhaustif qui documente l'architecture complete d'un framework PHP. Il encode en JSON :

- toutes les **classes** avec leurs methodes et proprietes,
- toutes les **interfaces** et leur contrat,
- tous les **traits** reutilisables,
- les **fonctions globales** organisees par namespace,
- les **fonctions conditionnelles** disponibles selon le contexte d'execution,
- les **metadonnees** du projet.

Ce format permet la generation automatique de documentation, la creation d'outils d'autocompletion, la validation de SDK, et l'interoperabilite entre frameworks.

---

## 2. Vue d'ensemble du fichier

Le fichier JSON est organise en deux niveaux de cles a la racine :

```
+--------------------------------------+
| Fichier JSON racine                  |
+--------------------------------------+
| :: cles (configuration globale)      |
|   ::class                            |
|   ::conditionals_functions           |
|   ::files                            |
|   ::interface                        |
|   ::meta                             |
|   ::namespaces                       |
|   ::trait                            |
+--------------------------------------+
| Cles ordinaires (fonctions globales) |
|   Namespace\Sous\NomFonction  -> {}  |
|   ...                                |
+--------------------------------------+
```

Les cles prefixees par `::` sont **reservees** pour la configuration. Toutes les autres cles representent des **fonctions globales** dont le nom encode le namespace PHP complet.

---

## 3. Statistiques du SDK

Le fichier `sdk.json` decrit le SDK .0 avec les caracteristiques suivantes :

```
+---------------------------+--------+
| Element                   | Nombre |
+---------------------------+--------+
| Classes                   |    x   |
| Interfaces                |    x   |
| Traits                    |    x   |
| Namespaces                |    x   |
| Fichiers sources          |    x   |
| Fonctions globales        |    x   |
| Fonctions conditionnelles |    x   |
| Methodes (total)          |   TOTAL|
+---------------------------+--------+
```

**Namespaces de premier niveau presents :**


---

## 4. Les cles de configuration globale

### 4.1 `::class`

Dictionnaire de toutes les **classes PHP** du SDK. Chaque entree est indexee par le **nom complet de la classe avec son namespace** (avec les backslashes PHP).

**Structure :**

```json
"::class": {
    "Namespace\\SousNamespace\\NomClasse": {
        "doc": "/** PHPDoc de la classe */",
        "type": "class",
        "$r": 42,
        "modifier": "abstract",
        "funcs": { ... },
        "props": { ... }
    }
}
```

**Proprietes disponibles a ce niveau :**

```
+----------+---------+-----+-------------------------------------------+
| Propriete| Type    | Req | Description                               |
+----------+---------+-----+-------------------------------------------+
| type     | string  | Oui | Toujours "class"                          |
| $r       | int     | Oui | Index de reference unique dans le SDK     |
| doc      | string  | Non | Bloc PHPDoc de la classe                  |
| modifier | string  | Non | "abstract" ou "final" (absent = normal)   |
| funcs    | object  | Non | Methodes de la classe                     |
| props    | object  | Non | Proprietes PHP de la classe               |
+----------+---------+-----+-------------------------------------------+
```

---

### 4.2 `::interface`

Dictionnaire de toutes les **interfaces PHP** du SDK. Comme les classes, les interfaces sont indexees par leur nom complet avec namespace.

**Structure :**

```json
"::interface": {
    "Cache\\CacheInterface": {
        "doc": "/** PHPDoc de l'interface */",
        "type": "interface",
        "$r": 58,
        "funcs": { ... }
    }
}
```

**Remarque importante :** La valeur de `type` est `"interface"`. Les interfaces peuvent avoir des `funcs` qui definissent le contrat a respecter.

---

### 4.3 `::trait`

Dictionnaire de tous les **traits PHP** du SDK. Les traits peuvent contenir des methodes (`funcs`) ET des proprietes (`props`).

**Structure :**

```json
"::trait": {
    "API\\ResponseTrait": {
        "doc": "/** PHPDoc du trait */",
        "type": "trait",
        "$r": 634,
        "funcs": { ... },
        "props": { ... }
    }
}
```

La presence de `props` est specifique aux traits (et aux classes), elle n'existe pas dans les interfaces.

---

### 4.4 `::conditionals_functions`

Dictionnaire de fonctions dont la **disponibilite est conditionnelle** selon l'environnement, la version PHP, ou une constante de compilation. Contrairement aux fonctions globales ordinaires, elles sont regroupees sous cette cle.

**Structure :**

```json
"::conditionals_functions": {
    "NomFonctionOuNamespace\\Fonction": {
        "doc": "/** PHPDoc */",
        "$r": 334,
        "params": [ ... ],
        "return": "type"
    }
}
```

Les cles peuvent etre :
- un **nom simple** (fonction sans namespace) : `"_from_random"`
- un **nom avec namespace** : `"Files\\fromString"`

**Exemple issu du SDK :**

```json
"::conditionals_functions": {
    "Files\\fromString": {
        "doc": "/** Allows the creation of a FileSizeUnit from Strings like \"kb\" */",
        "$r": 396,
        "params": [
            { "name": "$unit", "type": "string" }
        ],
        "return": "self"
    },
    "_has_protocol": {
        "doc": "/** Test the protocol of a URI. @return false|int */",
        "$r": 334,
        "params": [
            { "name": "$url", "type": "string" }
        ]
    }
}
```

---

### 4.5 `::files`

Tableau de tous les **fichiers PHP sources** associes au SDK. Les chemins sont relatifs ou absolus selon la configuration.

**Structure :**

```json
"::files": [
    "./src/Controllers/BaseController.php",
    "./src/API/ApiException.php",
    "..."
]
```

Le SDK  referencie **un certains nombre de fichiers**.

---

### 4.6 `::namespaces`

Tableau de tous les **espaces de noms PHP** declares dans le SDK.

**Structure :**

```json
"::namespaces": [
   // les espaces de nom déclarés
]
```

Les namespaces sont listes individuellement, y compris les sous-namespaces. Le SDK  en declare **122**.

---

### 4.7 `::meta`

Metadonnees descriptives du SDK ou du projet.

**Structure :**

```json
"::meta": {
    "framework": "nom_du_framework",
    "url": "url_de_telechargement",
    "versions": ["version"]
}
```

**Proprietes :**

```
+------------+--------+----------------------------------------------+
| Propriete  | Type   | Description                                  |
+------------+--------+----------------------------------------------+
| framework  | string | Identifiant du framework                     |
| url        | string | URL officielle du projet                     |
| versions   | array  | Liste des versions couvertes par ce schema   |
+------------+--------+----------------------------------------------+
```

---

## 5. Definition d'une classe

### 5.1 Proprietes de la classe

Toutes les cles possibles d'une definition de classe :

```json
"Cache\\CacheFactory": {
    "doc": "/** PHPDoc complet de la classe */",
    "type": "class",
    "$r": 127,
    "modifier": "final",
    "funcs": { ... },
    "props": { ... }
}
```

### 5.2 Methodes (`funcs`)

Dictionnaire des methodes de la classe, indexe par le **nom de la methode** (sans `$`).

```json
"funcs": {
    "nomMethode": {
        "modifier": "public",
        "doc": "/** PHPDoc de la methode */",
        "params": [ ... ],
        "return": "TypeRetour",
        "static": true
    }
}
```

**Toutes les cles possibles dans une methode :**

```
+----------+---------+-----+--------------------------------------------+
| Cle      | Type    | Req | Description                                |
+----------+---------+-----+--------------------------------------------+
| modifier | string  | Non | public / protected / private               |
| doc      | string  | Non | Bloc PHPDoc de la methode                  |
| params   | array   | Non | Liste des parametres                       |
| return   | string  | Non | Type de retour PHP                         |
| static   | bool    | Non | true si methode statique                   |
+----------+---------+-----+--------------------------------------------+
```

### 5.3 Proprietes PHP (`props`)

Dictionnaire des **proprietes PHP** de la classe ou du trait, indexe par le nom de la propriete (avec `$`).

```json
"props": {
    "$format": {
        "modifier": "protected",
        "doc": "/**\n * How to format the response data.\n * @var 'json'|'xml'|null\n */"
    },
    "$codes": {
        "modifier": "protected",
        "doc": "/** @var array<string, int> */"
    }
}
```

**Cles disponibles dans une propriete :**

```
+----------+--------+-----+----------------------------------------------+
| Cle      | Type   | Req | Description                                  |
+----------+--------+-----+----------------------------------------------+
| modifier | string | Non | public / protected / private                 |
| doc      | string | Non | PHPDoc incluant @var pour le typage          |
+----------+--------+-----+----------------------------------------------+
```

> Note : Le type de la propriete est encode dans le bloc `doc` via la balise `@var`.

### 5.4 Modificateurs de classe

La propriete `modifier` de la classe accepte les valeurs suivantes :

```
+----------+-----+---------------------------------------------+
| Valeur   | Nb  | Description                                 |
+----------+-----+---------------------------------------------+
| (absent) | 459 | Classe PHP standard (instanciable)          |
| abstract |  28 | Classe abstraite, ne peut etre instanciee   |
| final    |  33 | Classe finale, ne peut etre etendue         |
+----------+-----+---------------------------------------------+
```

---

## 6. Definition d'une interface

Les interfaces suivent la meme structure que les classes mais avec `"type": "interface"`. Elles ne peuvent pas avoir de `props`.

```json
"::interface": {
    "API\\TransformerInterface": {
        "doc": "/**\n * Interface for transforming resources into arrays.\n */",
        "type": "interface",
        "$r": 635,
        "funcs": {
            "toArray": {
                "modifier": "public",
                "doc": "/** Converts the resource to an array representation. */",
                "params": ["$resource"],
                "return": "array"
            }
        }
    }
}
```

**Differences avec une classe :**

```
+-------------+---------+-----------+
| Propriete   | Classe  | Interface |
+-------------+---------+-----------+
| type        | "class" | "interface"|
| funcs       | Oui     | Oui       |
| props       | Oui     | Non       |
| modifier    | Oui     | Non       |
+-------------+---------+-----------+
```

---

## 7. Definition d'un trait

Les traits utilisent `"type": "trait"` et peuvent avoir a la fois `funcs` et `props`, comme une classe.

```json
"::trait": {
    "ResponseTrait": {
        "doc": "/**\n * Provides HTTP response methods for APIs.\n * @property IncomingRequest $request\n */",
        "type": "trait",
        "$r": 634,
        "funcs": {
            "respond": {
                "modifier": "protected",
                "params": ["$data", {"name": "$status", "type": "int"}, {"name": "$message", "type": "string"}]
            }
        },
        "props": {
            "$format": {
                "modifier": "protected",
                "doc": "/** @var 'json'|'xml'|null */"
            }
        }
    }
}
```

---

## 8. Fonctions globales

Les fonctions globales sont definies comme **cles ordinaires** a la racine du fichier JSON (sans prefixe `::`). Leur cle encode le **namespace complet + nom de la fonction**, separes par `\`.

**Convention de nommage des cles :**

```
"Namespace\\SousNamespace\\nomFonction"
     |           |              |
     |           |              +-> nom PHP de la fonction
     |           +-> sous-namespace (optionnel)
     +-> namespace principal
```

**Exemple :**

```json
"CLI\\beep": {
    "doc": "/**\n * Beeps a certain number of times.\n * @param int $num\n * @return void\n */",
    "$r": 621,
    "params": [
        { "name": "$num", "type": "int" }
    ]
}
```

**Cles disponibles dans une fonction globale :**

```
+----------+--------+-----+----------------------------------------------+
| Cle      | Type   | Req | Description                                  |
+----------+--------+-----+----------------------------------------------+
| doc      | string | Non | Bloc PHPDoc                                  |
| $r       | int    | Non | Index de reference                           |
| params   | array  | Non | Liste des parametres                         |
| return   | string | Non | Type de retour                               |
+----------+--------+-----+----------------------------------------------+
```

> Note : Les fonctions globales n'ont pas de `modifier` ni de `static`, contrairement aux methodes.

---

## 9. Fonctions conditionnelles

Les fonctions conditionnelles (`::conditionals_functions`) sont des fonctions dont l'existence dans le runtime PHP depend d'une **condition** (extension chargee, version PHP, constante definie).

Elles partagent la meme structure que les fonctions globales :

```json
"::conditionals_functions": {
    "Files\\fromString": {
        "doc": "/** Creates a FileSizeUnit from a string like 'kb' or 'mb' */",
        "$r": 396,
        "params": [{ "name": "$unit", "type": "string" }],
        "return": "self"
    },
    "_from_random": {
        "doc": "/** Derived from Symfony ByteString */",
        "$r": 14
    }
}
```

**Differences avec les fonctions globales ordinaires :**

```
+-------------------------+--------------------+------------------------+
| Aspect                  | Fonction globale   | Fonction conditionnelle|
+-------------------------+--------------------+------------------------+
| Emplacement             | Cle racine du JSON | ::conditionals_functions|
| Disponibilite           | Toujours presente  | Selon condition runtime|
| Namespace dans la cle   | Oui                | Oui ou non             |
+-------------------------+--------------------+------------------------+
```

---

## 10. Specification des fonctions et methodes

### 10.1 Parametres

La propriete `params` accepte un tableau mixte de deux formats :

**Format simplifie (chaine) :**

```json
"params": ["$data"]
```

Utilise lorsqu'aucun type ni valeur par defaut n'est necessaire.

**Format etendu (objet) :**

```json
"params": [
    {
        "name": "$request",
        "type": "RequestInterface",
        "default": "null"
    }
]
```

**Proprietes d'un parametre :**

```
+----------+---------+-----+-------------------------------------------------+
| Propriete| Type    | Req | Description                                     |
+----------+---------+-----+-------------------------------------------------+
| name     | string  | Oui | Nom du parametre avec le $ prefixe              |
| type     | string  | Non | Type PHP (int, string, array, interface, etc.)  |
| default  | mixed   | Non | Valeur par defaut (constante, null, entier...)  |
+----------+---------+-----+-------------------------------------------------+
```

**Parametre variadic :**

Le prefixe `...` definit un parametre variadic (nombre variable d'arguments) :

```json
"params": ["...$args"]
```

**Exemple combine :**

```json
"params": [
    { "name": "$request", "type": "RequestInterface" },
    { "name": "$response", "type": "ResponseInterface" },
    { "name": "$logger", "type": "LoggerInterface" }
]
```

---

### 10.2 Type de retour

La propriete `return` contient le type PHP de retour :

```json
"return": "void"
"return": "string"
"return": "int"
"return": "bool"
"return": "array"
"return": "self"
"return": "ResponseInterface"
"return": "false|int"
```

Les **types union** (`false|int`) et les **types d'interface** sont supportes comme valeur de chaine simple.

---

### 10.3 Methodes statiques

La propriete `static` (boolean) marque une methode comme statique. Elle est absente si la methode n'est pas statique :

```json
"forInvalidFields": {
    "modifier": "public",
    "params": [{ "name": "$field", "type": "string" }],
    "return": "self",
    "static": true
}
```

Le SDK  contient **429 methodes statiques**.

---

### 10.4 PHPDoc

La propriete `doc` contient le bloc PHPDoc complet en chaine multi-lignes. Les sauts de ligne sont encodes en `\n` :

```json
"doc": "/**\n * Description de la methode.\n *\n * @param string $field Le champ invalide\n * @return self\n * @throws InvalidArgumentException\n */"
```

**Balises PHPDoc courantes dans ce schema :**

```
+-------------+----------------------------------------------+
| Balise      | Usage                                        |
+-------------+----------------------------------------------+
| @param      | Description et type d'un parametre           |
| @return     | Type et description de la valeur de retour   |
| @throws     | Exceptions levees par la methode             |
| @var        | Type d'une propriete (dans props)            |
| @property   | Proprietes virtuelles (dans doc de classe)   |
| @see        | Reference a d'autres elements                |
+-------------+----------------------------------------------+
```

---

## 11. Le champ `$r` (reference de fichier)

Le champ `$r` est un **index numerique** qui pointe directement vers l'entree correspondante dans le tableau `::files`. Il etablit le lien entre un element PHP (classe, interface, trait, fonction) et le **fichier source PHP** qui le contient.

**Principe :**

```
element[$r]  ->  ::files[$r]  ->  chemin du fichier PHP
```

**Verification sur le SDK  :**

```
+-----+-------------------------------------------+----------------------------------+
| $r  | ::files[$r]                               | Element                          |
+-----+-------------------------------------------+----------------------------------+
| 647 | ./app/Controllers/BaseController.php      | App\Controllers\BaseController   |
| 648 | ./app/Controllers/Home.php                | App\Controllers\Home             |
| 632 | ./system/API/ApiException.php             | CodeIgniter\API\ApiException     |
| 634 | ./system/API/ResponseTrait.php            | CodeIgniter\API\ResponseTrait    |
+-----+-------------------------------------------+----------------------------------+
```

**Regles importantes :**

- L'index `$r` est base **0** (premier fichier de `::files` = index 0)
- Plusieurs elements peuvent partager le meme `$r` si plusieurs classes/fonctions sont definies dans le meme fichier PHP
- Un element sans `$r` n'a pas de fichier source reference (element virtuel ou genere)
- La valeur maximale de `$r` ne peut pas depasser `len(::files) - 1`

**Exemple concret :**

```json
"::files": [
    "./system/API/ApiException.php",
    ...
    "./system/API/ResponseTrait.php"
],
"::class": {
    "API\\ApiException": {
        "type": "class",
        "$r": 0
    }
},
"::trait": {
    "API\\ResponseTrait": {
        "type": "trait",
        "$r": 2
    }
}
```

Ici, `$r: 0` signifie que `ApiException` est definie dans `::files[0]`, et `$r: 2` que `ResponseTrait` est dans `::files[2]`.

---

## 12. Nommage et namespaces dans les cles

### Cles de classes, interfaces et traits

Les elements PHP sont identifies par leur **nom complet qualifie (FQN)** avec les backslashes PHP (`\`) :

```
"Database\\Exceptions\\DatabaseException"
      |              |                    |
  namespace     sous-namespace        nom de la classe
```

### Cles de fonctions globales

Les fonctions globales combinent le **namespace + nom de la fonction** dans la cle :

```
"CLI\\beep"
      |         |    |
  namespace  module  nom
```

La partie avant le dernier `\` est le namespace, la partie apres est le nom PHP de la fonction.

### Fonctions sans namespace

Certaines fonctions conditionnelles peuvent ne pas avoir de namespace :

```json
"_from_random": { ... }
"_has_protocol": { ... }
```

---

## 13. Resume complet des cles

### Cles racine du fichier JSON

```
+---------------------------+----------+----------------------------------------------+
| Cle                       | Type     | Description                                  |
+---------------------------+----------+----------------------------------------------+
| ::class                   | object   | Dictionnaire des classes PHP                 |
| ::conditionals_functions  | object   | Fonctions a disponibilite conditionnelle     |
| ::files                   | array    | Chemins des fichiers PHP sources             |
| ::interface               | object   | Dictionnaire des interfaces PHP              |
| ::meta                    | object   | Metadonnees du projet                        |
| ::namespaces              | array    | Liste des espaces de noms                    |
| ::trait                   | object   | Dictionnaire des traits PHP                  |
| [Namespace\\Fonction]     | object   | Fonction globale (cle = FQN de la fonction)  |
+---------------------------+----------+----------------------------------------------+
```

### Proprietes d'une classe / interface / trait

```
+----------+-------+-------+---------+----------------------------------------------+
| Propriete| Classe| Iface | Trait   | Description                                  |
+----------+-------+-------+---------+----------------------------------------------+
| type     | Oui   | Oui   | Oui     | "class" / "interface" / "trait"              |
| $r       | Oui   | Oui   | Oui     | Index de reference unique                    |
| doc      | Non   | Non   | Non     | Bloc PHPDoc                                  |
| modifier | Non   | -     | -       | "abstract" ou "final"                        |
| funcs    | Non   | Non   | Non     | Methodes definies                            |
| props    | Non   | -     | Non     | Proprietes PHP                               |
+----------+-------+-------+---------+----------------------------------------------+
```

### Proprietes d'une methode (`funcs`)

```
+----------+--------+-----+----------------------------------------------+
| Propriete| Type   | Req | Description                                  |
+----------+--------+-----+----------------------------------------------+
| modifier | string | Non | public / protected / private                 |
| doc      | string | Non | Bloc PHPDoc                                  |
| params   | array  | Non | Liste des parametres (voir section 10.1)     |
| return   | string | Non | Type PHP de retour                           |
| static   | bool   | Non | true si methode statique                     |
+----------+--------+-----+----------------------------------------------+
```

### Proprietes d'une fonction globale

```
+----------+--------+-----+----------------------------------------------+
| Propriete| Type   | Req | Description                                  |
+----------+--------+-----+----------------------------------------------+
| doc      | string | Non | Bloc PHPDoc                                  |
| $r       | int    | Non | Index de reference                           |
| params   | array  | Non | Liste des parametres                         |
| return   | string | Non | Type PHP de retour                           |
+----------+--------+-----+----------------------------------------------+
```

---

## 14. Exemples complets

### Exemple 1 : Classe finale avec methodes statiques

```json
"::class": {
    "API\\ApiException": {
        "doc": "/** Custom exception for API-related errors. */",
        "type": "class",
        "$r": 632,
        "modifier": "final",
        "funcs": {
            "forInvalidFields": {
                "modifier": "public",
                "doc": "/** Thrown when the fields requested in a URL are not valid. */",
                "params": [{ "name": "$field", "type": "string" }],
                "return": "self",
                "static": true
            },
            "forTransformerNotFound": {
                "modifier": "public",
                "doc": "/** Thrown when a transformer class cannot be found. */",
                "params": [{ "name": "$transformerClass", "type": "string" }],
                "return": "self",
                "static": true
            }
        }
    }
}
```

### Exemple 2 : Classe abstraite avec parametres d'interface

```json
"::class": {
    "App\\Controllers\\BaseController": {
        "doc": "/**\n * BaseController provides a convenient place for loading components.\n * Extend this class in any new controllers.\n */",
        "type": "class",
        "$r": 647,
        "modifier": "abstract",
        "funcs": {
            "initController": {
                "modifier": "public",
                "doc": "/** @return void */",
                "params": [
                    { "name": "$request",  "type": "RequestInterface"  },
                    { "name": "$response", "type": "ResponseInterface" },
                    { "name": "$logger",   "type": "LoggerInterface"   }
                ]
            }
        }
    }
}
```

### Exemple 3 : Trait avec funcs et props

```json
"::trait": {
    "API\\ResponseTrait": {
        "doc": "/** Provides HTTP response helpers for API controllers. */",
        "type": "trait",
        "$r": 634,
        "funcs": {
            "respond": {
                "modifier": "protected",
                "params": [
                    "$data",
                    { "name": "$status",  "type": "int"    },
                    { "name": "$message", "type": "string" }
                ]
            }
        },
        "props": {
            "$format": {
                "modifier": "protected",
                "doc": "/** @var 'json'|'xml'|null */"
            },
            "$codes": {
                "modifier": "protected",
                "doc": "/** @var array<string, int> */"
            }
        }
    }
}
```

### Exemple 4 : Interface avec contrat de methode

```json
"::interface": {
    "Cache\\CacheInterface": {
        "doc": "/** Interface that defines all CacheHandler requirements. */",
        "type": "interface",
        "$r": 58,
        "funcs": {
            "get": {
                "modifier": "public",
                "doc": "/** Gets an item from the cache store. */",
                "params": [{ "name": "$key", "type": "string" }],
                "return": "mixed"
            },
            "save": {
                "modifier": "public",
                "params": [
                    { "name": "$key",  "type": "string" },
                    "$value",
                    { "name": "$ttl", "type": "int", "default": 60 }
                ],
                "return": "bool"
            }
        }
    }
}
```

### Exemple 5 : Fonctions globales avec namespace encode

```json
{
    "CLI\\beep": {
        "doc": "/**\n * Beeps a certain number of times.\n * @param int $num\n * @return void\n */",
        "$r": 621,
        "params": [{ "name": "$num", "type": "int" }]
    },
    "CLI\\color": {
        "doc": "/** Outputs a string formatted for the CLI with color and styling. */",
        "$r": 621,
        "params": [
            { "name": "$string",     "type": "string" },
            { "name": "$foreground", "type": "string" },
            { "name": "$background", "type": "string" },
            { "name": "$format",     "type": "string" }
        ],
        "return": "string"
    }
}
```

### Exemple 6 : Structure minimale valide

```json
{
    "::class": {},
    "::conditionals_functions": {},
    "::files": [],
    "::interface": {},
    "::meta": {
        "framework": "mon-framework",
        "url": "https://exemple.com",
        "versions": ["1.0"]
    },
    "::namespaces": [],
    "::trait": {}
}
```

---

*Documentation generee le 2026-02-24 par C.A.D BONDJE DOUE*
*Framework SDK JSON Schema Reference*
