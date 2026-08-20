// 인증이 필요해서 실패한 요청을 화면 셸(MainLayout)에 알리는 통로.
//
// client.js 는 컴포넌트가 아니라 훅을 쓸 수 없고, 9개 화면이 각자 "로그인하세요" 를
// 띄우면 문구가 흩어진다. 그래서 요청 계층에서 한 번 알리고 셸에서 한 번만 안내한다.

const listeners = new Set();

/**
 * 로그인이 필요하다는 신호를 구독한다.
 * @param {() => void} listener
 * @returns {() => void} 구독 해제 함수
 */
export function onLoginRequired(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyLoginRequired() {
  listeners.forEach((listener) => listener());
}
