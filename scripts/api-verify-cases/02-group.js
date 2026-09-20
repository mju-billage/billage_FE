/** 2단계 — 모임: 목록, 상세, 초대코드, 멤버. groupId 6("탈퇴테스트모임") 사용.
 * 초대코드는 재발급형(POST)이라 먼저 발급 후 GET current로 같은 값이 오는지 확인한다. */
module.exports = {
  stage: '2단계 — 모임',
  cases: [
    {
      name: 'group-list',
      method: 'GET',
      path: () => '/api/v1/groups',
      expectStatus: 200,
    },
    {
      name: 'group-detail',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}`,
      expectStatus: 200,
      expectFields: ['data.groupId', 'data.name'],
    },
    {
      name: 'group-invitation-create',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/invitations`,
      expectStatus: 201,
      expectFields: ['data.invitationCode', 'data.invitationLink', 'data.expiresAt'],
      after: (ctx, parsed) => {
        ctx.invitationCode = parsed.data.invitationCode;
      },
    },
    {
      name: 'group-invitation-current',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/invitations/current`,
      expectStatus: 200,
      expectFields: ['data.invitationCode'],
    },
    {
      name: 'group-memberships-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/memberships`,
      expectStatus: 200,
      expectFields: ['data[0].membershipId', 'data[0].userId', 'data[0].role'],
    },
    {
      name: 'group-members-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/members`,
      expectStatus: 200,
    },
  ],
};
