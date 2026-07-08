# Competitive Intelligence Workbench

## TL;DR
面向产品团队的竞品情报工作台，覆盖竞品资料、监控目标、采集任务、变化报告、反馈与知识写回状态。

## Capability Catalog
| capability | summary | evidence |
|---|---|---|
| CAP-001 Competitor Registry | 维护竞品与我方画像。 | ../components/competitive-intelligence.md |
| CAP-002 Target Monitoring | 推荐、创建、删除并采集监控目标。 | ../components/competitive-intelligence.md |
| CAP-003 Change Reports | 从快照差异晋升报告。 | ../components/competitive-intelligence.md |
| CAP-004 Feedback Loop | 标记已读、反馈、知识写回状态。 | ../components/competitive-intelligence.md |

## Business Rules Index
| rule | summary | evidence |
|---|---|---|
| BR-001 Noise Suppression | 高噪声变化不晋升 report。 | ../components/competitive-intelligence.md |
| BR-002 Target Cascade | 删除竞品会删除目标产物和相关报告。 | ../components/competitive-intelligence.md |

## Domain Events
| event | meaning | evidence |
|---|---|---|
| Capture Run | 监控目标的一次采集运行。 | ../components/competitive-intelligence.md |
| Change Promotion | 低噪声 change 晋升为 report。 | ../components/competitive-intelligence.md |

## AI-SDLC Traceability

| branch | repo | AC scope | plan/report |
|---|---|---|---|
| `001-competitive-intelligence-mvp` | nova-backend | 后端 API、持久化、采集、报告、反馈质量 | `nova-backend/.worktrees/aidlc-competitive-intelligence-mvp/.aisdlc/specs/001-competitive-intelligence-mvp/` |
| `001-competitive-intelligence-workbench` | nova-web | 竞品详情、监控目标、采集历史、调度、报告反馈 | `nova-web/.worktrees/aidlc-competitive-intelligence-workbench/.aisdlc/specs/001-competitive-intelligence-workbench/` |
