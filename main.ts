const test = (a:number) => a;

// 사용시 타입 추론
const res = test(2);

// extends 는 부분집합이라는 의미
type Test<T extends number> = T;

// 따라서 <> 에는 숫자만 올 수 있다.
type CC = Test<1>;

// 삼항으로 타입 리턴값을 구분할 수도 있다.
type Test2<T extends number> = T extends 2 ? 3 : 4;

// 2면 3으로 그 외의 숫자면 4로 추론되는 모습
type CCTEST = Test2<2>;

// infer 는 말그대로 추론이다.
// 아래 타입은 배열을 받고 배열중 첫번째 인자의 타입을 infer 하여 returnType 으로 정하고 있다.
type Head<T extends any[]> = T extends [infer A,...any[]]? A : undefined;

// 1로 결과 타입이 추론되는 모습
type CC1 = Head<[1, 2, 3, 4]>
type CC2 = Head<[1]>

// 첫번째 인자가 없기 때문에 추론되지 않고 있다.
type CC3 = Head<[]>

// 올바른 타입인지 체크하는 타입체커 유틸리티 타입 생성
// A 와 B 가 상호 부분집합이라면 같다고 보고 1을 returnType 으로, 아니라면 0으로 반환한다.
type Equal<A, B> = A extends B ? (B extends A ? 1 : 0) : 0;

const Pass = 1;
const Fail = 0;

// A B 타입이 같다면 1 다르다면 0 인것이 Equal 유틸리티 타입
// 인자는 제네릭 A, B에 따라 1과 0으로 타입이 추론되고 맞지 않다면 타입 에러가 발생
declare function check<A,B>(params: Equal<Equal<A, B> , typeof Pass>) : void;

check<1, 1>(Pass);
//check<1, 2>(Pass) 이 코드는 타입에러가 발생
check<1, 2>(Fail);

// 사용 예시
check<Head<[1, 2, 3, 4]>, 1>(Pass);
check<Head<[1]>, 2>(Fail)
check<Head<[]>, undefined>(Pass)
check<Head<[]>, 2>(Fail)

// Length 타입 유틸리티
type Length<T extends any[] | string, P extends any[] = []> = T extends any[] ?
  T["length"] :
  T extends `${T[0]}${infer A}` ?
    Length<A, Append<P, T[0]>> :
    Length<P>;
check<Length<[1, 2, 3]>, 3>(Pass);
check<Length<"123">, 3>(Pass);

// HasTail 타입 유틸리티
type HasTail<T extends any[]> = Length<T> extends 0 ? false : true;
check<HasTail<[1]>, true>(Pass);
check<HasTail<[]>, true>(Fail);
check<HasTail<[1, 2, 3]>, true>(Pass);

// Tail 타입 유틸리티
type Tail<T extends any[]> = T extends [any, ...infer A] ? A : [];
check<Tail<[1,2,3,4,5]>, [2,3,4,5]>(Pass);
check<Tail<[1,2,3,4,5]>, [2,3,4,5]>(Pass);

// Last 타입 유틸리티
type Last<T extends any[]> = T extends [...any[], infer A] ? A : undefined;
check<Last<[1, 2, 3, 4]>, 4>(Pass);

// Prepend 타입 유틸리티
type Prepend<T extends any[], E> = [E, ...T];
check<Prepend<[2, 3, 4], 1>, [1 ,2 ,3 , 4]>(Pass);

// Drop 타입 유틸리티 (중요) 37분
// returnType 을 객체로 정의하고 특정 키의 value 를 returnType 으로 정하는 모습이다.
type DropTest1<N, T extends any[]> = {
  0: T;
  1: any;
}[0];

// 여기서 조건식을 넣는다면 특정 조건에 따라 returnType 이 정해진다.
type DropTest2<N, T extends any[]> = {
  0: T;
  1: any;
}[Length<T> extends N ? 0 : 1];

// 여기서 P 배열 제네릭 타입을 이용해보자.
// T에서 N개 만큼의 데이터 요소를 pop 한 배열 타입을 P로 정의하고 싶은데 어떻게 해야할까
type DropTest3<N, T extends any[], P extends any[] = []> = {
  0: T;
  1: P;
}[Length<P> extends N ? 0 : 1];

// 재귀타입을 이용해보자
// 재귀를 이용하여 P의 배열 길이가 N에 다를때까지 T의 맨끝 요소를 P에 Prepend 한다.
// 탈출조건에 다다랐을때 남은 배열 T의 타입을 리턴한다.
type Drop<N, T extends any[], P extends any[] = []> = {
  0: T;
  1: Drop<N, Tail<T>, Prepend<P, any>>;
}[Length<P> extends N ? 0 : 1];

check<Drop<3, [1, 2, 3, 4, 5, 6]>, [4, 5, 6]>(Pass);
check<Drop<0, [1, 2, 3, 4, 5, 6]>, [4, 5, 6]>(Fail);
check<Drop<0, [1, 2, 3, 4, 5, 6]>, [1, 2, 3, 4, 5, 6]>(Pass);
check<Drop<3, [1, 2, 3, 4, 5, 6]>, [4, 5, 6]>(Pass);

// Reverse 타입 유틸리티
type Reverse<T extends any[], P extends any[] = []> = {
  0: P,
  1: Reverse<Tail<T>, Prepend<P, Head<T>>>,
}[Length<T> extends 0 ? 0 : 1];

check<Reverse<[1, 2, 3, 4, 5, 6]>, [6, 5, 4, 3, 2, 1]>(Pass);

// Concat 타입 유틸리티
type Concat<A extends any[], B extends any[]> = [...A, ...B];

check<Concat<[],[1, 2, 3]>, [1, 2, 3]>(Pass)

// Append 타입 유틸리티
type Append<A extends any[], B extends any> = [...A, B];

check<Append<[1, 2], 3>, [1, 2, 3]>(Pass)


////// 48:00 ////

// Join 유틸리티 타입
type Join<T extends any[], Sep extends string> =
  Length<T> extends 0 ? "" :
    Length<T> extends 1 ? `${T[0]}` :
      `${T[0]}${Sep}${Join<Tail<T>, Sep>}`;

check<Join<[1, 2, 3], ",">, "1,2,3">(Pass);
check<Join<[], ",">, "">(Pass);
check<Join<[1], ",">, "1">(Pass);

// Replace 유틸리티 타입
// infer 가 얼마나 유연한지 알 수 있는 유틸리티 타입
type Replace<T extends string, From extends string, To extends string> =
  T extends `${infer P1}${From}${infer P2}` ?
    Replace<`${P1}${To}${P2}`, From, To>
    : T;

check<Replace<"abcabc", "a", "c">, "cbccbc">(Pass);

// Split 유틸리티 타입
type Split<T extends string, S extends string, P extends any[] = []> =
  T extends `${infer P1}${S}${infer P2}` ?
    Split<P2, S, Append<P, P1>>
    : Append<P, T>;

check<Split<"a,b,c", ",">, ["a", "b", "c"]>(Pass);
check<Split<"asf,fff,eee,asdf", ",">, ["asf", "fff", "eee", "asdf"]>(Pass);

// Flat 유틸리티 타입
// 뺄셈이 되지 않는 유틸리티 타입에서 뺄셈 트릭 적용하기

type Flat<T, N extends number = 1> = {
  0: T;
  1: T extends Array<infer A> ? Flat<A, Add<N, -1>> : T;
}[N extends -1 ? 0 : 1];

declare function flat<T extends any[], N extends number = 1>(
  arr: T,
  n?: N
): Flat<T, N>[];

check<Flat<[1, 2, 3, 4, [5]]>,  1 | 2 | 3 | 4 | 5>(Pass);
check<Flat<[1, 2, 3, [[4]]]>,  [4]>(Pass);
check<Flat<[1, 2, 3, [[4]], 5], 2>,  [4]>(Fail);
check<Flat<[1, 2, 3, [4, [5]]]>,  1 | 2 | 3 | 4 | [5]>(Pass);
check<Flat<[1, 2, 3, 4, 5]>,  1 | 2 | 3 | 4 | 5>(Pass);

const arr = flat([1, 2, 3]);
const arr2 = flat([1, 2, 3, [4]]);
const arr3 = flat([1, 2, 3, [[4]]], 2);

type IterationMap = {
  __: [number, "+" | "-" | "0", "__", "__"];
  "-2": [-2, "-", "__", "-1"];
  "-1": [-1, "-", "-2", "0"];
  "0": [0, "0", "-1", "1"];
  "1": [1, "+", "0", "2"];
  "2": [2, "+", "1", "3"];
  "3": [3, "+", "2", "4"];
  "4": [4, "+", "3", "5"];
  "5": [5, "+", "4", "6"];
  "6": [6, "+", "5", "__"];
};

type Iteration = [
  n: number,
  sign: "+" | "-" | "0",
  prev: keyof IterationMap,
  next: keyof IterationMap
];

type Pos<T extends Iteration> = T[0];
type Next<T extends Iteration> = IterationMap[T[3]];
type Prev<T extends Iteration> = IterationMap[T[2]];

type IterationOf<T extends number> = `${T}` extends keyof IterationMap
  ? IterationMap[`${T}`]
  : IterationMap[`__`];

// 0 1 2 3
// 0 1 2
// 2 -> 0 // 2 prev 1 -> 3

// 1, -2
// 0 1
// -2 -1 0

type IsNegative<N extends Iteration> = {
  "-": true;
  "+": false;
  "0": false;
}[N[1]];

type AddNegative<N1 extends Iteration, N2 extends Iteration> = {
  0: Pos<N1>;
  1: AddNegative<Prev<N1>, Next<N2>>;
}[Pos<N2> extends 0 ? 0 : 1];
type AddPositive<N1 extends Iteration, N2 extends Iteration> = {
  0: Pos<N1>;
  1: AddPositive<Next<N1>, Prev<N2>>;
}[Pos<N2> extends 0 ? 0 : 1];

type _Add<
  N1 extends Iteration,
  N2 extends Iteration
> = IsNegative<N2> extends true ? AddNegative<N1, N2> : AddPositive<N1, N2>;

type Add<N1 extends number, N2 extends number> = _Add<
  IterationOf<N1>,
  IterationOf<N2>
>;

check<Add<1, 2>, 3>(Pass);
check<Add<1, -1>, 0>(Pass);
check<Add<1, -2>, -1>(Pass);
check<Add<3, -2>, 1>(Pass);