# JavaScript エラースタックトレース（コールフレーム）を理解し、デコレータのエラー位置を捉える

## 要約

本記事では、JavaScript で呼び出しコードの位置情報、特にデコレータ関数の位置情報を取得する方法について探求します。JavaScript のエラースタックトレースに深入りし、`Error.captureStackTrace` を使用してコールフレームの位置を捉える方法を学び、エラー位置を特定する方法を理解します。

JavaScript のエラースタックトレースには通常、コード呼び出しの階層構造情報が含まれますが、しばしば多くの無関係な関数呼び出しも含まれます。デコレータパターンなどのシナリオでは、クラスに適用されるデコレータ関数の位置を捉えたいことがあります。この目標を達成するには、エラースタックの構造を理解し、呼び出し位置を正確に取得する方法を知る必要があります。

## 使用事例

特定のエラータイプをスローするためにカスタマイズされたエラークラスがあります。デバッグ目的でエラーがスローされたときにエラー位置を記録するログシステムが必要です。このシナリオでは、最初は `console.log` を使用してエラーの詳細を取得しました。しかし、すべてのエラークラスに `console.log` ステートメントを記述するのではなく、エラークラス内でエラーの位置に直接アクセスしたいと考えました。ここでデコレータが役立ち、便利さとより整ったコードを提供します。

以下はコードの例です：

```typescript
import { Log } from "../logs/Logs";

@Log.logErrorClass
class JceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JceError";
  }
}

export default JceError;
```

## JavaScript エラースタックトレース内でコンストラクタを呼び出すための `Reflect.construct` の使用

### 要約

JavaScript では、コンストラクタ内でデコレータを直接呼び出すことはできません。そのため、デコレータ内でコンストラクタを呼び出す必要があり、これを実現するために `Reflect.construct` を使用します。

このデコレータはエラーの位置を記録するために使用されます：

```typescript
/**
 * エラーログ用のクラスデコレータ。このデコレートされたクラスがインスタンス化されると、エラー情報が記録されます。
 *
 * @param target - デコレートされるクラス。
 *
 * @example
 * @Log.logErrorClass
 * class MyErrorClass { // ... }
 */
static logErrorClass(...args: any[]) {
    // オリジナルのコンストラクタを保存
    const original: Function = args[0];

    // 新しいコンストラクタの挙動
    const f: any = function (...args: any[]) {
        let instance;

        try {
            // オリジナルのクラスのインスタンス化を試行
            instance = Reflect.construct(original, args, new.target);

            // 位置とパラメータを記録
            const location = Log.getCallerLocation();
            const params = JSON.stringify(args);

            // インスタンスに位置とパラメータ情報を添付
            instance.location = location;
            instance.params = params;

            console.log(
                chalk.red('[Error Class]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(params),
            );
        } catch (error: any) {
            // コンストラクタ内のエラーをキャッチし、コンソールにエラー情報をカラーで表示
            const stackLines = error.stack?.split('\n');
            const location = stackLines ? stackLines[1].trim() : '不明な位置';

            console.log(
                chalk.red('[エラー]'),
                chalk.blue(`(${location}):`),
                chalk.yellow(error.message),
            );

            throw error; // エラーを再スロー
        }

        return instance;
    };

    // instanceof 演算子が動作するようにプロト

タイプをコピー
    f.prototype = original.prototype;

    // 新しいコンストラクタを返す（元のコンストラクタを置き換える）
    return f;
}
```

私たちは `logErrorClass` デコレータをエラークラスに適用する意図がありますが、デコレータ関数の位置は望ましいものではありません。デコレータ関数が適用されるクラスの位置を捉えたいのです。これにより、この記事の中心的な概念である**エラースタック**が導入されます。

## 解説

JavaScript では、エラースタックトレース（スタックトレース）はコードの呼び出し階層構造情報を含んでいます。通常、スタックのトップには現在のコード実行位置が含まれ、その下に関数やメソッドの呼び出し位置が徐々に含まれています。このスタックは通常、テキスト文字列で、各行がコールフレーム（call frame）を表し、関数やメソッドの名前とコード内の位置が含まれています。

私たちは、デコレータ関数が適用されたクラスの位置をキャプチャしたいと考えています。しかし、スタックには他の関数呼び出しも含まれており、JavaScript エンジンの内部関数や Node.js ランタイム関数などが含まれていることがあります。したがって、デコレータ関数が適用される場所を取得する正しい行を見つける必要があります。

### **エラースタックの一般的な構造**

JavaScript のエラースタックは通常、次のような構造を持っています。

1. 最初の行にはエラーメッセージの説明が含まれており、通常はアプリケーションコードの位置情報は含まれていません。
2. 2 行目は通常、`Error.captureStackTrace` 関数の呼び出しで、アプリケーションコードの位置も含まれていません。
3. 3 行目は通常、デコレータ関数が適用されたクラスの呼び出し位置を含んでおり、これがキャプチャしたい位置です。
4. 以降の行には、他の関数呼び出しの位置が含まれており、デコレータ位置に関心のない場合もあります。

正しいデコレータ位置を取得するために、次の仮定を行っています。

- スタックに少なくとも 4 行ある場合、通常はデコレータ位置は 4 行目にあると仮定し、デコレータ位置として 4 行目の内容を返します。
- スタックの行数が 4 行に満たない場合、デコレータ位置を特定できないため、デフォルトの "Unknown Location" を返します。

この仮定は一般的なケースに基づいており、実際のスタック構造は環境によって異なることがあるため、適切な行数を選択する必要があるかもしれません。

## **デコレータ位置をキャプチャする方法**

デコレータ関数が適用されたクラスの位置をキャプチャするには、`Error.captureStackTrace` メソッドを使用することができます。このメソッドを使用すると、カスタムエラーオブジェクトを作成し、現在のコード実行のスタック情報をキャプチャすることができます。デコレータ位置をキャプチャするためのステップは次のとおりです。

1. 空のエラーオブジェクト、例えば `error` を作成します。
2. `Error.captureStackTrace(error, captureFunction)` を呼び出します。ここで `captureFunction` はスタック情報をどこでキャプチャするかを示すプレースホルダ関数で、
3. スタック情報を解析します。通常、デコレータ関数の

呼び出し位置はスタックの 3 行目にあると仮定しています（スタックの 4 行目にあると仮定しています）。この位置を取得して記録できます。

以下はコードの例です：

```typescript
function getCallerLocation() {
  const error = {};
  Error.captureStackTrace(error, getCallerLocation);

  const stackLines = error.stack.split("\n");

  // 呼び出し位置が通常、スタックの3行目にあると仮定
  if (stackLines.length >= 4) {
    return stackLines[3].trim();
  } else {
    return "不明な位置";
  }
}
```

この例では、`getCallerLocation` 関数がデコレータ関数の呼び出し位置をキャプチャし、それを返します。実際のスタック構造はプロジェクトの要件に応じて異なる場合があるため、行数を適切に調整する必要があるかもしれません。

## **デコレータ位置をキャプチャする他の方法**

### **`Error.stackTraceLimit` を使用する**

`Error.stackTraceLimit` プロパティはスタックの最大行数を指定するために使用されます。デフォルトでは、この値は `10` ですが、`Infinity` に設定することで完全なスタック情報を取得できます。以下はコードの例です：

```typescript
// スタックの最大行数を Infinity に設定
Error.stackTraceLimit = Infinity;
```

## **テスト**

`getCallerLocation` 関数をテストするために、次のコードを使用できます：

```typescript
import JceError from "./JceError";

function throwError() {
  throw new JceError("これはテストエラーです");
}

try {
  throwError();
} catch (error: any) {
  console.error("エラーをキャッチしました:", error.message);
}
```

出力は次のようになります：

```bash
[エラークラス] (at Object.<anonymous> (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/jce.spec.ts:8:5)): ["これはテストエラーです"]
エラーをキャッチしました: これはテストエラーです
```

これはカスタムエラーなので、コンストラクタ自体に問題はありません。コンストラクタ自体にエラーが発生する場合のみ、コードが catch ステートメントに入ります。例：

```typescript
class JceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JceError";

    throw new Error("Method not implemented.");
  }
}
```

出力は次のようになります：

```bash
[エラー] (at new JceError (/Users/fengwenxuan/Desktop/node/amigo-bot/packages/core/src/jce/JceError.ts:9:15)): Method not implemented.
エラーをキャッチしました: これはテストエラーです
```

**注意**: これはカスタムエラーなので、`console.error("エラーをキャッチしました:", error.message);` は常にエラーメッセージを表示します。システムエラーの場合、動作が異なる場合があります。

**まとめ**

JavaScript のエラースタックには、コード呼び出しの階層構造に関する情報が含まれていますが、通常は関連のない多くの関数呼び出しも含まれています。スタック構造を理解し、`Error.captureStackTrace` メソッドを使用することで、デコレータ関数の位置をキャプチャし、コード実行の洞察を提供できます。
