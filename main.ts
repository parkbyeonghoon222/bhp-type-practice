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

// infer는 말그대로 추론이다.
// 아래 타입은 배열을 받고 배열중  첫번째 인자의 타입을 infer 하여 returnType 으로 정하고 있다.
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

check<Head<[1, 2, 3, 4]>, 1>(Pass);
check<1, 2>(Fail)
check<1, 2>(Fail)
check<1, 2>(Fail)